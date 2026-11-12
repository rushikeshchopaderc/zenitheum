import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { loadConfig } from "../config.js";
import { createAdminRepository } from "../repositories/admin.js";
import { DEV_ADMIN_EMAIL, bootstrapAdmin } from "../services/bootstrap.js";
import { verifyPassword } from "../services/auth.js";
import { openTestDb } from "./helpers.js";

let db;
let admin;
before(async () => {
  db = await openTestDb();
  admin = createAdminRepository(db);
});
after(() => db.close());
beforeEach(() => db.exec("TRUNCATE admin_sessions, audit_log, admin_users CASCADE"));

const logger = () => {
  const lines = [];
  return { lines, info: (m) => lines.push(`info ${m}`), warn: (m) => lines.push(`warn ${m}`), error: (m) => lines.push(`error ${m}`) };
};
const config = (admin = {}, env = "development") => loadConfig({ NODE_ENV: env }, { admin });

describe("first administrator", () => {
  it("is created from ADMIN_EMAIL and ADMIN_PASSWORD, without logging the password", async () => {
    const log = logger();
    const made = await bootstrapAdmin(admin, config({ bootstrapEmail: "Boss@Example.com", bootstrapPassword: "a long enough password" }), log);
    assert.equal(made, true);
    const user = await admin.findByEmail("boss@example.com");
    assert.equal(await verifyPassword("a long enough password", user.passwordHash), true);
    assert.ok(!log.lines.join("\n").includes("a long enough password"));
  });

  it("refuses a short password", async () => {
    const log = logger();
    assert.equal(await bootstrapAdmin(admin, config({ bootstrapEmail: "a@example.com", bootstrapPassword: "short" }), log), false);
    assert.equal(await admin.count(), 0);
    assert.match(log.lines.join("\n"), /at least 12/);
  });

  it("never touches an existing account", async () => {
    await admin.createUser({ email: "old@example.com", name: null, passwordHash: "x" });
    assert.equal(await bootstrapAdmin(admin, config({ bootstrapEmail: "new@example.com", bootstrapPassword: "another long password" }), logger()), false);
    assert.equal(await admin.count(), 1);
  });

  it("gives a developer on the embedded database a one-time login when nothing is configured", async () => {
    const log = logger();
    assert.equal(await bootstrapAdmin(admin, config(), log, { devAccount: true }), true);
    const password = log.lines.join("\n").match(/\/\s+(\S+)/)[1];
    assert.equal(await verifyPassword(password, (await admin.findByEmail(DEV_ADMIN_EMAIL)).passwordHash), true);
  });

  it("never invents an account in production, or on a real PostgreSQL", async () => {
    const log = logger();
    assert.equal(await bootstrapAdmin(admin, config({}, "production"), log, { devAccount: true }), false);
    assert.equal(await bootstrapAdmin(admin, config(), log, { devAccount: false }), false);
    assert.equal(await admin.count(), 0);
    assert.match(log.lines.join("\n"), /no administrator exists yet/);
  });
});
