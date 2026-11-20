import { camel, camelAll, likePattern, page, whereBuilder, withUniqueRef } from "./shared.js";

/** INSERT helper: column names come from code constants only, values are always bound parameters. */
const insertSql = (table, columns) => `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")})`;

const dateRange = (w, column, { from, to }) => {
  if (from) w.add(`${column} >= ?::timestamptz`, from);
  if (to) w.add(`${column} < ?::timestamptz`, to);
};

/** Contacts ("ask a question"), job applications and the chip-news list. */
export function createLeadRepository(db) {
  const count = async (table, w) => (await db.query(`SELECT count(*)::int AS n FROM ${table} ${w.sql}`, w.params)).rows[0].n;

  return {
    // ------------------------------------------------------------------ contacts

    createContact: (input) =>
      withUniqueRef(async (ref) => {
        const { rows } = await db.query(
          `${insertSql("contacts", ["ref", "name", "email", "phone", "organisation", "job_title", "segment", "chip", "analog_format", "topic", "message"])} RETURNING id, ref, created_at`,
          [ref, input.name, input.email, input.phone || null, input.organisation || null, input.jobTitle || null, input.segment || null, input.chip || null, input.analogFormat || null, input.topic || "question", input.message]
        );
        return camel(rows[0]);
      }),

    async listContacts({ status, topic, segment, chip, q, from, to, ...paging } = {}) {
      const w = whereBuilder();
      if (status) w.add("status = ?", status);
      if (topic) w.add("topic = ?", topic);
      if (segment) w.add("segment = ?", segment);
      if (chip) w.add("chip = ?", chip);
      dateRange(w, "created_at", { from, to });
      if (q) w.add("(name ILIKE ? OR email ILIKE ? OR organisation ILIKE ? OR message ILIKE ? OR ref ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = await count("contacts", w);
      const { rows } = await db.query(`SELECT * FROM contacts ${w.sql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, w.params);
      return { rows: camelAll(rows), total };
    },

    async updateContact(id, { status, notes }) {
      const { rows } = await db.query(
        "UPDATE contacts SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = now() WHERE id = $1 RETURNING *",
        [id, status ?? null, notes ?? null]
      );
      return camel(rows[0]);
    },

    deleteContact: async (id) => (await db.query("DELETE FROM contacts WHERE id = $1", [id])).rowCount > 0,

    // ------------------------------------------------------------------ applications (resumes live in Google Drive)

    createApplication: (input, resume) =>
      withUniqueRef(async (ref) => {
        const { rows } = await db.query(
          `${insertSql("applications", ["ref", "job_slug", "job_title", "track", "name", "email", "phone", "organisation", "profile_url", "note", "resume_name", "resume_url", "resume_file_id"])} RETURNING id, ref, created_at`,
          [
            ref, input.jobSlug, input.jobTitle, input.track || null, input.name, input.email, input.phone, input.organisation || null,
            input.profile || null, input.note || null, resume?.name ?? null, resume?.url ?? null, resume?.fileId ?? null,
          ]
        );
        return camel(rows[0]);
      }),

    async listApplications({ job, status, track, q, from, to, ...paging } = {}) {
      const w = whereBuilder();
      if (job) w.add("job_slug = ?", job);
      if (status) w.add("status = ?", status);
      if (track) w.add("track = ?", track);
      dateRange(w, "created_at", { from, to });
      if (q) w.add("(name ILIKE ? OR email ILIKE ? OR organisation ILIKE ? OR job_title ILIKE ? OR ref ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = await count("applications", w);
      const { rows } = await db.query(
        `SELECT *, (resume_url IS NOT NULL) AS has_resume FROM applications ${w.sql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        w.params
      );
      return { rows: camelAll(rows), total };
    },

    async updateApplication(id, { status, notes }) {
      const { rows } = await db.query(
        "UPDATE applications SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = now() WHERE id = $1 RETURNING *",
        [id, status ?? null, notes ?? null]
      );
      return camel(rows[0]);
    },

    deleteApplication: async (id) => (await db.query("DELETE FROM applications WHERE id = $1", [id])).rowCount > 0,

    // ------------------------------------------------------------------ chip release news

    /** Returns { created }: false when the address was already on the list (the caller answers identically). */
    async subscribe({ email, name, chip, analogFormat, source }) {
      const inserted = await db.query(
        "INSERT INTO subscribers (email, name, chip, analog_format, source) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING RETURNING id",
        [email, name || null, chip || null, analogFormat || null, source || null]
      );
      if (inserted.rowCount) return { created: true };
      // Signing up again is a fresh opt-in: reactivate, and keep the latest preferences.
      await db.query(
        `UPDATE subscribers SET status = 'active', unsubscribed_at = NULL, chip = COALESCE($2, chip), analog_format = COALESCE($3, analog_format),
                name = COALESCE($4, name) WHERE email = $1`,
        [email, chip || null, analogFormat || null, name || null]
      );
      return { created: false };
    },

    async listSubscribers({ status, chip, q, ...paging } = {}) {
      const w = whereBuilder();
      if (status) w.add("status = ?", status);
      if (chip) w.add("chip = ?", chip);
      if (q) w.add("(email ILIKE ? OR name ILIKE ? OR source ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = await count("subscribers", w);
      const { rows } = await db.query(`SELECT * FROM subscribers ${w.sql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, w.params);
      return { rows: camelAll(rows), total };
    },

    async setSubscriberStatus(id, status) {
      const { rows } = await db.query(
        "UPDATE subscribers SET status = $2, unsubscribed_at = CASE WHEN $2 = 'unsubscribed' THEN now() ELSE NULL END WHERE id = $1 RETURNING *",
        [id, status]
      );
      return camel(rows[0]);
    },

    deleteSubscriber: async (id) => (await db.query("DELETE FROM subscribers WHERE id = $1", [id])).rowCount > 0,
  };
}
