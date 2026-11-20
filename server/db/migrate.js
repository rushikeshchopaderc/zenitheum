import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { milestones } from "../../shared/milestones.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const MIGRATIONS_DIR = path.join(root, "database", "migrations");

/**
 * Apply every pending database/migrations/NNN_name.sql, in order, in one transaction.
 * Safe to run on every start and from several API replicas at once (advisory lock on PostgreSQL).
 */
export async function migrate(db, { dir = MIGRATIONS_DIR } = {}) {
  await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);

  const files = fs
    .readdirSync(dir)
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort();

  const applied = [];
  await db.tx(async (q) => {
    if (db.kind === "postgres") await q.query("SELECT pg_advisory_xact_lock($1)", [727274]);
    const done = new Set((await q.query("SELECT version FROM schema_migrations")).rows.map((row) => row.version));
    for (const file of files) {
      if (done.has(file)) continue;
      await q.exec(fs.readFileSync(path.join(dir, file), "utf8"));
      await q.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      applied.push(file);
    }
  });
  return applied;
}

/**
 * Keep the roadmap's milestone list in step with shared/milestones.js. New milestones are inserted,
 * and rows nobody has edited follow the file; a milestone edited from the admin console is left alone.
 */
export async function seedMilestones(db) {
  for (const [index, m] of milestones.entries()) {
    await db.query(
      `INSERT INTO milestones (id, track, kind, title, detail, target_date, status, completed_on, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8::date, $9)
       ON CONFLICT (id) DO UPDATE SET
         track = EXCLUDED.track, kind = EXCLUDED.kind, title = EXCLUDED.title, detail = EXCLUDED.detail,
         target_date = EXCLUDED.target_date, status = EXCLUDED.status, completed_on = EXCLUDED.completed_on,
         sort_order = EXCLUDED.sort_order, updated_at = now()
       WHERE milestones.edited = false`,
      [m.id, m.track, m.kind ?? "milestone", m.title, m.detail ?? "", m.targetDate, m.status ?? "upcoming", m.completedOn ?? null, index]
    );
  }
  // A milestone dropped from the file disappears too, unless someone edited it in the console.
  await db.query("DELETE FROM milestones WHERE edited = false AND id <> ALL($1::text[])", [milestones.map((m) => m.id)]);
}
