import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDb } from "./db/index.js";
import { migrate, purgeAnalytics, seedMilestones } from "./db/migrate.js";
import { bootstrapAdmin } from "./services/bootstrap.js";

const config = loadConfig();

// Data tier first: connect, bring the schema up to date, make sure the roadmap milestones exist.
let db;
try {
  db = await createDb(config, console);
  const applied = await migrate(db);
  if (applied.length) console.info(`[db] applied migrations: ${applied.join(", ")}`);
  await seedMilestones(db);
} catch (error) {
  console.error(`\nCould not start the database tier: ${error.message}\n`);
  await db?.close().catch(() => {});
  process.exit(1);
}

const { app, repos } = createApp({ config, db });
await bootstrapAdmin(repos.admin, config, console, { devAccount: db.kind === "pglite" });

const server = app.listen(config.port, config.host, () => {
  console.info(`Zenitheum server listening on http://localhost:${config.port} (${config.env}, database: ${db.kind})`);
});

// Retention: raw analytics older than the window are deleted (leads keep their own attribution copy).
const RETENTION_CHECK_MS = 6 * 60 * 60 * 1000;
const purge = async () => {
  try {
    const removed = await purgeAnalytics(db, config.analytics.retentionDays);
    if (removed) console.info(`[db] retention: removed ${removed} sessions older than ${config.analytics.retentionDays} days`);
  } catch (error) {
    console.error(`[db] retention job failed: ${error.message}`);
  }
};
const purgeTimer = setInterval(purge, RETENTION_CHECK_MS);
purgeTimer.unref();
purge();

// Close cleanly on container / process-manager stop: stop accepting requests, then release the database.
let closing = false;
const shutdown = (signal) => {
  if (closing) return;
  closing = true;
  console.info(`${signal} received — shutting down`);
  clearInterval(purgeTimer);
  setTimeout(() => process.exit(1), 10_000).unref();
  server.close(async () => {
    await db.close().catch((error) => console.error(`[db] close failed: ${error.message}`));
    process.exit(0);
  });
  server.closeIdleConnections?.();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
