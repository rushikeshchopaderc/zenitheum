import crypto from "node:crypto";

import { asBuffer } from "../db/index.js";
import { camel, camelAll, likePattern, page, whereBuilder, withUniqueRef } from "./shared.js";

const ATTRIBUTION_COLUMNS = ["visitor_id", "session_id", "channel", "utm_source", "utm_medium", "utm_campaign", "referrer_host", "landing_path"];

/** INSERT helper: column names come from code constants only, values are always bound parameters. */
function insertSql(table, columns) {
  const marks = columns.map((_, i) => `$${i + 1}`).join(", ");
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${marks})`;
}

export function createLeadRepository(db) {
  return {
    // ------------------------------------------------------------------ contacts

    createContact: (input, attribution) =>
      withUniqueRef(async (ref) => {
        const columns = ["ref", "name", "email", "phone", "organisation", "job_title", "topic", "segment", "chip", "volume", "message", ...ATTRIBUTION_COLUMNS];
        const values = [
          ref,
          input.name,
          input.email,
          input.phone || null,
          input.organisation || null,
          input.jobTitle || null,
          input.topic,
          input.segment || null,
          input.chip || null,
          input.volume || null,
          input.message,
          ...ATTRIBUTION_COLUMNS.map((c) => attribution[c] ?? null),
        ];
        const { rows } = await db.query(`${insertSql("contacts", columns)} RETURNING id, ref, created_at`, values);
        return camel(rows[0]);
      }),

    async listContacts({ status, topic, segment, chip, channel, q, from, to, ...paging } = {}) {
      const w = whereBuilder();
      if (status) w.add("status = ?", status);
      if (topic) w.add("topic = ?", topic);
      if (segment) w.add("segment = ?", segment);
      if (chip) w.add("chip = ?", chip);
      if (channel) w.add("channel = ?", channel);
      if (from) w.add("created_at >= ?::timestamptz", from);
      if (to) w.add("created_at < ?::timestamptz", to);
      if (q) w.add("(name ILIKE ? OR email ILIKE ? OR organisation ILIKE ? OR message ILIKE ? OR ref ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM contacts ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(
        `SELECT * FROM contacts ${w.sql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        w.params
      );
      return { rows: camelAll(rows), total };
    },

    async updateContact(id, { status, notes }) {
      const { rows } = await db.query(
        `UPDATE contacts SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = now()
          WHERE id = $1 RETURNING *`,
        [id, status ?? null, notes ?? null]
      );
      return camel(rows[0]);
    },

    async deleteContact(id) {
      return (await db.query("DELETE FROM contacts WHERE id = $1", [id])).rowCount > 0;
    },

    // ------------------------------------------------------------------ applications

    createApplication: (input, attribution, file) =>
      withUniqueRef((ref) =>
        db.tx(async (q) => {
          const columns = ["ref", "job_slug", "job_title", "track", "name", "email", "phone", "organisation", "profile_url", "note", ...ATTRIBUTION_COLUMNS];
          const values = [
            ref,
            input.jobSlug,
            input.jobTitle,
            input.track || null,
            input.name,
            input.email,
            input.phone,
            input.organisation || null,
            input.profile || null,
            input.note || null,
            ...ATTRIBUTION_COLUMNS.map((c) => attribution[c] ?? null),
          ];
          const { rows } = await q.query(`${insertSql("applications", columns)} RETURNING id, ref, created_at`, values);
          const application = rows[0];
          if (file) {
            await q.query(
              `INSERT INTO application_files (application_id, filename, mime_type, size_bytes, sha256, content)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [application.id, file.filename, file.mimeType, file.buffer.length, crypto.createHash("sha256").update(file.buffer).digest("hex"), file.buffer]
            );
          }
          return camel(application);
        })
      ),

    async listApplications({ job, status, track, channel, q, from, to, ...paging } = {}) {
      const w = whereBuilder();
      if (job) w.add("a.job_slug = ?", job);
      if (status) w.add("a.status = ?", status);
      if (track) w.add("a.track = ?", track);
      if (channel) w.add("a.channel = ?", channel);
      if (from) w.add("a.created_at >= ?::timestamptz", from);
      if (to) w.add("a.created_at < ?::timestamptz", to);
      if (q) w.add("(a.name ILIKE ? OR a.email ILIKE ? OR a.organisation ILIKE ? OR a.job_title ILIKE ? OR a.ref ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM applications a ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(
        `SELECT a.*, f.filename AS resume_name, f.size_bytes AS resume_size, (f.application_id IS NOT NULL) AS has_resume
           FROM applications a LEFT JOIN application_files f ON f.application_id = a.id
           ${w.sql} ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        w.params
      );
      return { rows: camelAll(rows), total };
    },

    async updateApplication(id, { status, notes }) {
      const { rows } = await db.query(
        `UPDATE applications SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = now()
          WHERE id = $1 RETURNING *`,
        [id, status ?? null, notes ?? null]
      );
      return camel(rows[0]);
    },

    async getResume(applicationId) {
      const { rows } = await db.query(
        "SELECT filename, mime_type, size_bytes, content FROM application_files WHERE application_id = $1",
        [applicationId]
      );
      const row = rows[0];
      return row && { filename: row.filename, mimeType: row.mime_type, size: row.size_bytes, content: asBuffer(row.content) };
    },

    async deleteApplication(id) {
      return (await db.query("DELETE FROM applications WHERE id = $1", [id])).rowCount > 0; // resume cascades
    },

    // ------------------------------------------------------------------ early-access list

    /** Returns { created }: false when the address was already on the list (the caller answers identically). */
    async subscribe({ email, source }, attribution) {
      const inserted = await db.query(
        `INSERT INTO subscribers (email, source, visitor_id, channel, utm_source, utm_medium, utm_campaign)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING RETURNING id`,
        [email, source || null, attribution.visitor_id, attribution.channel, attribution.utm_source, attribution.utm_medium, attribution.utm_campaign]
      );
      if (inserted.rowCount) return { created: true };
      // Signing up again is a fresh opt-in, so a previously unsubscribed address becomes active.
      await db.query("UPDATE subscribers SET status = 'active', unsubscribed_at = NULL WHERE email = $1 AND status <> 'active'", [email]);
      return { created: false };
    },

    async listSubscribers({ status, q, ...paging } = {}) {
      const w = whereBuilder();
      if (status) w.add("status = ?", status);
      if (q) w.add("(email ILIKE ? OR source ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM subscribers ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(`SELECT * FROM subscribers ${w.sql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, w.params);
      return { rows: camelAll(rows), total };
    },

    async setSubscriberStatus(id, status) {
      const { rows } = await db.query(
        `UPDATE subscribers SET status = $2, unsubscribed_at = CASE WHEN $2 = 'unsubscribed' THEN now() ELSE NULL END
          WHERE id = $1 RETURNING *`,
        [id, status]
      );
      return camel(rows[0]);
    },

    async deleteSubscriber(id) {
      return (await db.query("DELETE FROM subscribers WHERE id = $1", [id])).rowCount > 0;
    },
  };
}
