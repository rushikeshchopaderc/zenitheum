import { HttpError } from "../lib/errors.js";
import { camel, camelAll, isUniqueViolation, likePattern, page, whereBuilder, withUniqueRef } from "./shared.js";

export function createDemoRepository(db) {
  return {
    /** Reserve the slot and store the request. The unique index makes a double booking impossible, even under a race. */
    create: (input) =>
      withUniqueRef(async (ref) => {
        try {
          const { rows } = await db.query(
            `INSERT INTO demos (ref, name, email, phone, organisation, job_title, segment, chip, analog_format, message, slot_start, slot_end, visitor_timezone)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
              ref, input.name, input.email, input.phone, input.organisation, input.jobTitle || null, input.segment || null, input.chip,
              input.analogFormat || null, input.message || null, input.slotStart, input.slotEnd, input.visitorTimezone || null,
            ]
          );
          return camel(rows[0]);
        } catch (error) {
          if (isUniqueViolation(error) && /slot/i.test(error.constraint ?? error.detail ?? error.message ?? "")) {
            throw new HttpError(409, "slot_taken", "That time was just taken. Please pick another slot.");
          }
          throw error;
        }
      }),

    /** Start times (ISO) of slots that are already booked in [from, to). Nothing else about a booking leaves the server. */
    async takenSlots(from, to) {
      const { rows } = await db.query(
        "SELECT slot_start FROM demos WHERE status IN ('requested', 'scheduled') AND slot_start >= $1::timestamptz AND slot_start < $2::timestamptz",
        [from, to]
      );
      return rows.map((r) => new Date(r.slot_start).toISOString());
    },

    async setMeeting(id, { meetLink, eventId }) {
      const { rows } = await db.query(
        "UPDATE demos SET meet_link = $2, calendar_event_id = $3, status = 'scheduled', updated_at = now() WHERE id = $1 RETURNING *",
        [id, meetLink, eventId]
      );
      return camel(rows[0]);
    },

    async get(id) {
      return camel((await db.query("SELECT * FROM demos WHERE id = $1", [id])).rows[0]);
    },

    async list({ status, chip, upcoming, q, ...paging } = {}) {
      const w = whereBuilder();
      if (status) w.add("status = ?", status);
      if (chip) w.add("chip = ?", chip);
      if (upcoming) w.addRaw("slot_start >= now() AND status IN ('requested', 'scheduled')");
      if (q) w.add("(name ILIKE ? OR email ILIKE ? OR organisation ILIKE ? OR ref ILIKE ?)", likePattern(q));
      const { limit, offset } = page(paging);
      const total = (await db.query(`SELECT count(*)::int AS n FROM demos ${w.sql}`, w.params)).rows[0].n;
      const { rows } = await db.query(
        `SELECT * FROM demos ${w.sql} ORDER BY ${upcoming ? "slot_start ASC" : "slot_start DESC"} LIMIT ${limit} OFFSET ${offset}`,
        w.params
      );
      return { rows: camelAll(rows), total };
    },

    async update(id, { status, notes }) {
      const { rows } = await db.query(
        "UPDATE demos SET status = COALESCE($2, status), notes = COALESCE($3, notes), updated_at = now() WHERE id = $1 RETURNING *",
        [id, status ?? null, notes ?? null]
      );
      return camel(rows[0]);
    },

    delete: async (id) => (await db.query("DELETE FROM demos WHERE id = $1", [id])).rowCount > 0,
  };
}
