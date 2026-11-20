import crypto from "node:crypto";

import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDb } from "./db/index.js";
import { migrate, seedMilestones } from "./db/migrate.js";

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

// Staff console login comes from the environment. On a developer's machine with nothing set, make a throw-away one.
if (!config.admin.email || !config.admin.password) {
  if (config.env !== "production") {
    config.admin.email = "admin@zenitheum.local";
    config.admin.password = crypto.randomBytes(15).toString("base64url");
    console.info(`[admin] development console login (changes on every start): ${config.admin.email}  /  ${config.admin.password}`);
  } else {
    console.warn("[admin] ADMIN_EMAIL / ADMIN_PASSWORD are not set: the staff console is disabled.");
  }
}

const { app } = createApp({ config, db });

const server = app.listen(config.port, config.host, () => {
  console.info(`Zenitheum server listening on http://localhost:${config.port} (${config.env}, database: ${db.kind})`);
});

// Close cleanly on container / process-manager stop: stop accepting requests, then release the database.
let closing = false;
const shutdown = (signal) => {
  if (closing) return;
  closing = true;
  console.info(`${signal} received — shutting down`);
  setTimeout(() => process.exit(1), 10_000).unref();
  server.close(async () => {
    await db.close().catch((error) => console.error(`[db] close failed: ${error.message}`));
    process.exit(0);
  });
  server.closeIdleConnections?.();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
