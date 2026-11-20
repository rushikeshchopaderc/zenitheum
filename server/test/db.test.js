import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { migrate, seedMilestones } from "../db/migrate.js";
import { milestones } from "../../shared/milestones.js";
import { openTestDb } from "./helpers.js";

let db;
before(async () => {
  db = await openTestDb();
});
after(() => db.close());

describe("data tier", () => {
  it("applies each migration once and is safe to run again", async () => {
    assert.deepEqual(await migrate(db), []);
    const { rows } = await db.query("SELECT version FROM schema_migrations ORDER BY version");
    assert.deepEqual(rows.map((r) => r.version), ["001_init.sql", "002_simplify.sql", "003_customisation.sql", "004_demo_requests.sql"]);
  });

  it("keeps only the business tables: no visit tracking, no staff accounts, no resumes", async () => {
    const tables = (await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1")).rows.map((r) => r.table_name);
    assert.deepEqual(tables.filter((n) => n !== "schema_migrations"), ["applications", "contacts", "demos", "milestones", "orders", "subscribers"]);
  });

  it("has the columns the forms capture", async () => {
    const cols = async (table) => (await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [table])).rows.map((r) => r.column_name);
    for (const c of ["preferred_date", "preferred_time", "chip", "analog_format", "phone", "organisation", "status"]) assert.ok((await cols("demos")).includes(c), `demos.${c}`);
    for (const c of ["slot_start", "slot_end", "meet_link", "calendar_event_id", "visitor_timezone"]) assert.ok(!(await cols("demos")).includes(c), `demos.${c} is gone`);
    for (const c of ["quantity", "delivery_date", "delivery_location", "contact_name", "customisation", "analog_format", "chip"]) assert.ok((await cols("orders")).includes(c), `orders.${c}`);
    for (const c of ["resume_name", "resume_url", "resume_file_id"]) assert.ok((await cols("applications")).includes(c), `applications.${c}`);
    for (const c of ["chip", "analog_format", "email"]) assert.ok((await cols("subscribers")).includes(c), `subscribers.${c}`);
    assert.ok(!(await cols("contacts")).includes("utm_source"), "no tracking columns");
  });

  it("seeds the broad milestones and re-seeding never overwrites an edit", async () => {
    assert.equal((await db.query("SELECT count(*)::int AS n FROM milestones")).rows[0].n, milestones.length);
    await db.query("UPDATE milestones SET title = 'stale' WHERE id = 'M-01'");
    await db.query("UPDATE milestones SET title = 'edited', edited = true WHERE id = 'M-02'");
    await db.query("INSERT INTO milestones (id, track, title, target_date) VALUES ('X-01', 'company', 'old', '2027-01-01'), ('X-02', 'company', 'kept', '2027-01-01')");
    await db.query("UPDATE milestones SET edited = true WHERE id = 'X-02'");
    await seedMilestones(db);
    const title = async (id) => (await db.query("SELECT title FROM milestones WHERE id = $1", [id])).rows[0]?.title;
    assert.equal(await title("M-01"), milestones[0].title);
    assert.equal(await title("M-02"), "edited");
    assert.equal(await title("X-01"), undefined, "dropped from the file");
    assert.equal(await title("X-02"), "kept", "edited rows are never deleted");
  });

  it("enforces the vocabularies in the database itself", async () => {
    const demo = (ref, status, chip = "analog", time = null) => db.query(
      `INSERT INTO demos (ref, name, email, phone, organisation, chip, status, preferred_time) VALUES ($1, 'n', 'e@x.com', '1234567', 'o', $3, $2, $4)`,
      [ref, status, chip, time]);
    await demo("ZT-D1", "requested");
    await demo("ZT-D2", "requested");
    await assert.rejects(demo("ZT-D4", "bogus"), /check/i);
    await assert.rejects(demo("ZT-D5", "requested", "quantum"), /check/i);
    await assert.rejects(demo("ZT-D6", "requested", "analog", "midnight"), /check/i);
    await assert.rejects(db.query("INSERT INTO orders (ref, contact_name, email, phone, organisation, chip, quantity, delivery_date, delivery_location) VALUES ('ZT-O1','n','e@x.com','1','o','analog',0,'2027-01-01','x')"), /check/i);
    await assert.rejects(db.query("UPDATE milestones SET status = 'done' WHERE id = 'M-01'"), /check/i);
    await db.exec("TRUNCATE demos");
  });
});
