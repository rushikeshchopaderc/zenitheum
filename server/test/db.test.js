import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { MIGRATIONS_DIR, migrate, purgeAnalytics, seedMilestones } from "../db/migrate.js";
import { milestones } from "../../shared/milestones.js";
import { IOS_UA, beacon, openTestDb, startServer } from "./helpers.js";

let db;
before(async () => {
  db = await openTestDb();
});
after(() => db.close());

describe("data tier", () => {
  it("applies each migration once and is safe to run again", async () => {
    assert.deepEqual(await migrate(db), []);
    const { rows } = await db.query("SELECT version FROM schema_migrations ORDER BY version");
    assert.ok(rows.length >= 1);
    assert.ok(MIGRATIONS_DIR.endsWith("database/migrations"));
  });

  it("seeds every milestone and keeps ids unique", async () => {
    const { rows } = await db.query("SELECT count(*)::int AS n FROM milestones");
    assert.equal(rows[0].n, milestones.length);
    assert.equal(new Set(milestones.map((m) => m.id)).size, milestones.length);
  });

  it("re-seeding follows the file for untouched rows but never overwrites an edit", async () => {
    await db.query("UPDATE milestones SET title = 'stale title' WHERE id = 'C-01'");
    await db.query("UPDATE milestones SET title = 'edited in console', edited = true WHERE id = 'C-02'");
    await seedMilestones(db);
    const title = async (id) => (await db.query("SELECT title FROM milestones WHERE id = $1", [id])).rows[0].title;
    assert.equal(await title("C-01"), milestones.find((m) => m.id === "C-01").title);
    assert.equal(await title("C-02"), "edited in console");
  });

  it("drops milestones removed from the file unless someone edited them", async () => {
    await db.query("INSERT INTO milestones (id, track, title, target_date) VALUES ('X-01', 'company', 'old plan', '2027-01-01'), ('X-02', 'company', 'kept', '2027-01-01')");
    await db.query("UPDATE milestones SET edited = true WHERE id = 'X-02'");
    await seedMilestones(db);
    const ids = (await db.query("SELECT id FROM milestones WHERE id LIKE 'X-%'")).rows.map((r) => r.id);
    assert.deepEqual(ids, ["X-02"]);
  });

  it("enforces the status vocabularies in the database itself", async () => {
    await assert.rejects(db.query("INSERT INTO contacts (ref, name, email, topic, message, status) VALUES ('ZT-X', 'n', 'e@x.com', 't', 'm', 'bogus')"), /check/i);
    await assert.rejects(db.query("UPDATE milestones SET status = 'done' WHERE id = 'C-01'"), /check/i);
    await assert.rejects(db.query("INSERT INTO subscribers (email) VALUES ('dup@example.com'), ('dup@example.com')"), /unique|duplicate/i);
  });

  it("retention deletes old raw analytics but leads keep their own attribution", async () => {
    const t = await startServer({ db });
    try {
      const b = beacon();
      await t.call("POST", "/api/collect", { headers: { "user-agent": IOS_UA }, body: JSON.stringify(b.payload) });
      await t.call("POST", "/api/contact", { body: { name: "Asha", email: "a@example.com", topic: "other", message: "Hello there, a question.", consent: true, visitorId: b.vid, sessionId: b.sid } });
      await db.query("UPDATE sessions SET last_activity_at = now() - interval '600 days'");
      await db.query("UPDATE visitors SET last_seen_at = now() - interval '600 days'");
      assert.equal(await purgeAnalytics(db, 540), 1);
      assert.equal((await db.query("SELECT count(*)::int AS n FROM sessions")).rows[0].n, 0);
      assert.equal((await db.query("SELECT count(*)::int AS n FROM page_views")).rows[0].n, 0, "children cascade");
      assert.equal((await db.query("SELECT count(*)::int AS n FROM visitors")).rows[0].n, 0);
      const lead = (await db.query("SELECT * FROM contacts")).rows[0];
      assert.equal(lead.channel, "social");
      assert.equal(lead.session_id, null);
      assert.equal(await purgeAnalytics(db, 0), 0, "0 disables the job");
    } finally {
      await t.close();
    }
  });
});
