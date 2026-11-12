import { camel, camelAll } from "./shared.js";

const SELECT = `SELECT id, track, kind, title, detail, target_date::text AS target_date, status,
                       completed_on::text AS completed_on, sort_order, edited, updated_at
                  FROM milestones`;

export function createMilestoneRepository(db, { timezone }) {
  return {
    async list() {
      return camelAll((await db.query(`${SELECT} ORDER BY sort_order, target_date`)).rows);
    },

    /**
     * Admin edit. Completing a milestone stamps today's date (in the business time zone) unless a date
     * is supplied; moving it back to any other status clears the date. The row is then marked
     * `edited`, which stops re-seeding from shared/milestones.js from overwriting it.
     */
    async update(id, { status, targetDate, completedOn, detail }) {
      const { rows } = await db.query(
        `UPDATE milestones SET
           status       = COALESCE($2, status),
           target_date  = COALESCE($3::date, target_date),
           detail       = COALESCE($5, detail),
           completed_on = CASE
                            WHEN COALESCE($2, status) = 'completed'
                              THEN COALESCE($4::date, completed_on, (now() AT TIME ZONE $6)::date)
                            ELSE NULL
                          END,
           edited = true, updated_at = now()
         WHERE id = $1
         RETURNING id`,
        [id, status ?? null, targetDate ?? null, completedOn ?? null, detail ?? null, timezone]
      );
      if (!rows[0]) return null;
      return camel((await db.query(`${SELECT} WHERE id = $1`, [id])).rows[0]);
    },
  };
}
