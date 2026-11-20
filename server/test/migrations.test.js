import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { loadConfig } from "../config.js";
import { createDb } from "../db/index.js";
import { MIGRATIONS_DIR, migrate } from "../db/migrate.js";

const quiet = { info() {}, warn() {}, error() {} };

describe("migration 004 (demo requests)", () => {
  it("turns a booked slot into a preferred day and drops the calendar columns, keeping the row", async () => {
    // A database as it was before 004: only migrations 001-003 applied, with a booked demo in it.
    const earlier = fs.mkdtempSync(path.join(os.tmpdir(), "zt-migrations-"));
    for (const file of fs.readdirSync(MIGRATIONS_DIR).filter((f) => !f.startsWith("004_"))) fs.copyFileSync(path.join(MIGRATIONS_DIR, file), path.join(earlier, file));

    const url = process.env.TEST_DATABASE_URL || "";
    const db = await createDb(loadConfig({ NODE_ENV: "test" }, { databaseUrl: url, pgliteDir: "" }), quiet);
    try {
      if (url) await db.exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
      assert.deepEqual(await migrate(db, { dir: earlier }), ["001_init.sql", "002_simplify.sql", "003_customisation.sql"]);
      // 23:30 UTC on 1 March is already 2 March in India.
      await db.query(
        `INSERT INTO demos (ref, name, email, phone, organisation, chip, slot_start, slot_end, meet_link, status)
         VALUES ('ZT-OLD1', 'Old', 'old@example.com', '1234567', 'Old Co', 'analog', '2027-03-01T23:30:00Z', '2027-03-02T00:00:00Z', 'https://meet.google.com/x', 'scheduled')`
      );

      assert.deepEqual(await migrate(db), ["004_demo_requests.sql"]);
      const row = (await db.query("SELECT *, preferred_date::text AS preferred_date FROM demos")).rows[0];
      assert.equal(row.ref, "ZT-OLD1");
      assert.equal(row.status, "scheduled");
      assert.equal(row.preferred_date, "2027-03-02");
      for (const gone of ["slot_start", "slot_end", "meet_link", "calendar_event_id", "visitor_timezone"]) assert.ok(!(gone in row), `${gone} is gone`);
    } finally {
      await db.close();
      fs.rmSync(earlier, { recursive: true, force: true });
    }
  });
});
