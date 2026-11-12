/**
 * The data tier's single entry point. Everything above this file speaks one small interface:
 *
 *   db.kind                    "postgres" | "pglite"
 *   db.query(sql, params)      -> { rows, rowCount }      (one statement, $1…$n parameters)
 *   db.exec(sql)               -> void                    (many statements, no parameters)
 *   db.tx(async (q) => …)      -> result                  (q has query/exec; commits, or rolls back on throw)
 *   db.close()
 *
 * PostgreSQL (node-postgres) is the real thing and is required in production. PGlite is PostgreSQL
 * compiled to WebAssembly: development and tests use it when no DATABASE_URL is set, so `npm run dev`
 * and `npm test` need no database server. Both speak the same SQL dialect, so there is one set of
 * migrations and one set of queries.
 */

import fs from "node:fs";
import path from "node:path";

const asBuffer = (value) => (Buffer.isBuffer(value) ? value : Buffer.from(value));

/** bytea comes back as a Buffer from pg and as a Uint8Array from PGlite. */
export { asBuffer };

async function createPostgres(config, log) {
  const { default: pg } = await import("pg");

  // Make pg return the same JS types PGlite does: numbers for int8/numeric, text for dates.
  pg.types.setTypeParser(20, (v) => Number.parseInt(v, 10));
  pg.types.setTypeParser(1700, (v) => Number.parseFloat(v));
  pg.types.setTypeParser(1082, (v) => v);

  const ssl = config.databaseSsl === "true" ? true : config.databaseSsl === "no-verify" ? { rejectUnauthorized: false } : undefined;
  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    max: config.pgPoolMax,
    ssl,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (error) => log.error?.(`[db] idle client error: ${error.message}`));

  await pool.query("SELECT 1"); // fail fast, with a clear message, if the database is unreachable

  const bind = (client) => ({
    query: async (text, params = []) => {
      const result = await client.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
    },
    exec: async (text) => {
      await client.query(text);
    },
  });

  return {
    kind: "postgres",
    ...bind(pool),
    async tx(work) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await work(bind(client));
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

const processAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
};

/**
 * An embedded PGlite directory must only ever be open in one process: two writers corrupt it. A small
 * lock file next to it names the owner, so `npm run inbox` (or a second `npm run dev`) fails with a clear
 * message instead of silently damaging the data. A lock left by a crashed process is recognised and replaced.
 */
function lockDirectory(dir) {
  const lockPath = `${dir}.lock`;
  if (fs.existsSync(lockPath)) {
    const owner = Number.parseInt(fs.readFileSync(lockPath, "utf8"), 10);
    if (owner && owner !== process.pid && processAlive(owner)) {
      throw new Error(
        `The embedded development database at ${dir} is already open in process ${owner} (probably \`npm run dev\`). ` +
          "Stop that process first, or set DATABASE_URL to use a PostgreSQL server, which any number of processes can share."
      );
    }
  }
  fs.writeFileSync(lockPath, String(process.pid));
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    try {
      if (fs.readFileSync(lockPath, "utf8") === String(process.pid)) fs.unlinkSync(lockPath);
    } catch {
      /* already gone */
    }
  };
  process.once("exit", release);
  return release;
}

async function createPglite(config, log) {
  let PGlite;
  try {
    ({ PGlite } = await import("@electric-sql/pglite"));
  } catch {
    throw new Error(
      "DATABASE_URL is not set and the embedded development database (@electric-sql/pglite) is not installed. " +
        "Point DATABASE_URL at a PostgreSQL server (see the README), or run `npm install`."
    );
  }
  const dir = config.pgliteDir || undefined; // falsy -> in-memory (tests)
  let release = () => {};
  if (dir) {
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    release = lockDirectory(dir);
    log.info?.(`[db] embedded PostgreSQL (PGlite) at ${dir} — set DATABASE_URL to use a real server`);
  }
  const db = dir ? new PGlite(dir) : new PGlite();
  try {
    await db.waitReady;
  } catch (error) {
    release();
    throw error;
  }

  const bind = (client) => ({
    query: async (text, params = []) => {
      const result = await client.query(text, params);
      return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
    },
    exec: async (text) => {
      await client.exec(text);
    },
  });

  return {
    kind: "pglite",
    ...bind(db),
    tx: (work) => db.transaction(async (t) => work(bind(t))),
    close: async () => {
      await db.close();
      release();
    },
  };
}

export async function createDb(config, log = console) {
  if (config.databaseUrl) return createPostgres(config, log);
  if (config.env === "production") {
    throw new Error("DATABASE_URL is required when NODE_ENV=production (PostgreSQL 14 or newer).");
  }
  return createPglite(config, log);
}
