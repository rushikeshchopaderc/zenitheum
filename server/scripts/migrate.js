/**
 * Apply database migrations and seed the roadmap milestones. The API does this on every start; run it on its
 * own (`npm run db:migrate`) when you want to prepare a database before the first start, e.g. in a deploy step.
 */
import { migrate, seedMilestones } from "../db/migrate.js";
import { loadConfig } from "../config.js";
import { createDb } from "../db/index.js";

const config = loadConfig();
let db;
try {
  db = await createDb(config, console);
} catch (error) {
  console.error(`\n${error.message}\n`);
  process.exit(1);
}
try {
  const applied = await migrate(db);
  await seedMilestones(db);
  console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Schema is up to date.");
  const { rows } = await db.query("SELECT version FROM schema_migrations ORDER BY version");
  console.log(`Database: ${db.kind} · migrations on record: ${rows.map((r) => r.version).join(", ")}`);
} finally {
  await db.close();
}
