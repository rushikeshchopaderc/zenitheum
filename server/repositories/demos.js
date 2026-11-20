import { camel, camelAll, likePattern, page, whereBuilder, withUniqueRef } from "./shared.js";

export function createDemoRepository(db) {
  return {
    /** Store a demo request (dates are read back as text: PGlite would otherwise hand out Date objects). The customer's preferred day and time of day are wishes; the team confirms by e-mail. */
    create: (input) =>
      withUniqueRef(async (ref) => {
        const { rows } = await db.query(
          `INSERT INTO demos (ref, name, email, phone, organisation, job_title, segment, chip, analog_format, message, preferred_date, preferred_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *, preferred_date::text AS preferred_date`,
          [
            ref, input.name, input.email, input.phone, input.organisation, input.jobTitle || null, input.segment || null, input.chip,
            input.analogFormat || null, input.message || null, input.preferredDate || null, input.preferredTime || null,
          ]
        );
        return camel(rows[0]);
      }),

    async get(id) {
      return camel((await db.query("SELECT *, preferred_date::text AS preferred_date FROM demos WHERE id = $1", [id])).rows[0]);
    },

    async list({ status, chip, q, ...paging } = {}) {
      const w = whereBuilder();
      if (status) w.add("status = ?", status);
      if (chip) w.add("chip = ?", chip);
      if (q) w.add("(name ILIKE ? OR email ILIKE ? OR organisation ILIKE ? OR ref ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM demos ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(`SELECT *, preferred_date::text AS preferred_date FROM demos ${w.sql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, w.params);
      return { rows: camelAll(rows), total };
    },

    async update(id, { status, notes }) {
      const { rows } = await db.query(
        "UPDATE demos SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = now() WHERE id = $1 RETURNING *, preferred_date::text AS preferred_date",
        [id, status ?? null, notes ?? null]
      );
      return camel(rows[0]);
    },

    delete: async (id) => (await db.query("DELETE FROM demos WHERE id = $1", [id])).rowCount > 0,
  };
}
