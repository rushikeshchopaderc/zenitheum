import { camel, camelAll, likePattern, page, whereBuilder, withUniqueRef } from "./shared.js";

export function createOrderRepository(db) {
  return {
    create: (input) =>
      withUniqueRef(async (ref) => {
        const { rows } = await db.query(
          `INSERT INTO orders (ref, contact_name, email, phone, organisation, job_title, chip, analog_format, quantity, delivery_date,
                               delivery_location, customisation, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date, $11, $12, $13) RETURNING id, ref, created_at`,
          [
            ref, input.contactName, input.email, input.phone, input.organisation, input.jobTitle || null, input.chip, input.analogFormat || null,
            input.quantity, input.deliveryDate, input.deliveryLocation, input.customisation || null, input.notes || null,
          ]
        );
        return camel(rows[0]);
      }),

    async list({ status, chip, q, ...paging } = {}) {
      const w = whereBuilder();
      if (status) w.add("status = ?", status);
      if (chip) w.add("chip = ?", chip);
      if (q) w.add("(contact_name ILIKE ? OR email ILIKE ? OR organisation ILIKE ? OR delivery_location ILIKE ? OR ref ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM orders ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(
        `SELECT *, delivery_date::text AS delivery_date FROM orders ${w.sql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        w.params
      );
      return { rows: camelAll(rows), total };
    },

    async update(id, { status, internalNotes }) {
      const { rows } = await db.query(
        `UPDATE orders SET status = COALESCE($2, status), internal_notes = COALESCE($3, internal_notes), updated_at = now()
          WHERE id = $1 RETURNING *, delivery_date::text AS delivery_date`,
        [id, status ?? null, internalNotes ?? null]
      );
      return camel(rows[0]);
    },

    delete: async (id) => (await db.query("DELETE FROM orders WHERE id = $1", [id])).rowCount > 0,
  };
}
