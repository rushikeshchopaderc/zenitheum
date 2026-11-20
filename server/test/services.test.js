import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadConfig } from "../config.js";
import { checkCredentials, createThrottle, signSession, verifySession } from "../services/auth.js";
import { createGoogle, googleScopes } from "../services/google.js";
import { todayInIndia } from "../lib/dates.js";

const cfg = (extra = {}) => loadConfig({ NODE_ENV: "test" }, { admin: { email: "a@example.com", password: "a long enough password", ...extra.admin }, google: { clientId: "id", clientSecret: "secret", refreshToken: "refresh", ...extra.google } });

describe("dates", () => {
  it("knows today's date in India, which is already tomorrow late in the UTC evening", () => {
    assert.equal(todayInIndia(new Date("2026-11-19T10:00:00Z")), "2026-11-19");
    assert.equal(todayInIndia(new Date("2026-11-19T20:00:00Z")), "2026-11-20");
  });
});

describe("staff session", () => {
  it("signs, verifies, expires and rejects tampering", () => {
    const c = cfg();
    const token = signSession(c);
    assert.equal(verifySession(c, token).email, "a@example.com");
    assert.equal(verifySession(c, token, Date.now() + 9 * 3600_000), null, "expired after 8 hours");
    assert.equal(verifySession(c, `${token}x`), null);
    assert.equal(verifySession(c, undefined), null);
    assert.equal(verifySession(cfg({ admin: { password: "another long password" } }), token), null, "changing the password signs everyone out");
  });

  it("checks the single configured account without leaking which half was wrong", () => {
    const c = cfg();
    assert.equal(checkCredentials(c, " A@Example.com ", "a long enough password"), true);
    assert.equal(checkCredentials(c, "a@example.com", "wrong"), false);
    assert.equal(checkCredentials(c, "b@example.com", "a long enough password"), false);
    assert.equal(checkCredentials(cfg({ admin: { email: "", password: "" } }), "", ""), false, "nothing configured means nobody gets in");
  });

  it("throttle locks after five failures and unlocks later", () => {
    const th = createThrottle();
    for (let i = 0; i < 4; i += 1) th.fail("k", 1000);
    assert.equal(th.locked("k", 1000), false);
    th.fail("k", 1000);
    assert.equal(th.locked("k", 1000), true);
    assert.equal(th.locked("k", 1000 + 16 * 60_000), false);
  });
});

describe("Google client", () => {
  /** A scripted fetch: each call is matched against the routes in order. */
  function scripted(routes) {
    const seen = [];
    const doFetch = async (url, init = {}) => {
      seen.push({ url: String(url), init });
      for (const [match, reply] of routes) {
        if (String(url).includes(match) && (!reply.method || reply.method === (init.method ?? "GET"))) {
          const body = typeof reply.body === "function" ? reply.body(init) : reply.body;
          return new Response(JSON.stringify(body), { status: reply.status ?? 200, headers: { "content-type": "application/json" } });
        }
      }
      throw new Error(`unscripted ${url}`);
    };
    return { doFetch, seen };
  }
  const token = ["oauth2.googleapis.com/token", { body: { access_token: "AT", expires_in: 3600 } }];

  it("is disabled until the three credentials are present", () => {
    assert.equal(createGoogle(loadConfig({ NODE_ENV: "test" }, {})).enabled, false);
    assert.equal(createGoogle(cfg()).enabled, true);
  });

  it("stores a resume in a Drive folder it creates once", async () => {
    const { doFetch, seen } = scripted([
      token,
      ["/drive/v3/files?q=", { body: { files: [] } }],
      ["/drive/v3/files?fields=id", { method: "POST", body: { id: "folder1" } }],
      ["/upload/drive/v3/files", { method: "POST", body: { id: "file1", webViewLink: "https://drive.google.com/file/d/file1/view" } }],
    ]);
    const g = createGoogle(cfg(), { fetch: doFetch });
    const a = await g.uploadResume({ name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 hi") });
    await g.uploadResume({ name: "cv2.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 yo") });
    assert.deepEqual(a, { fileId: "file1", url: "https://drive.google.com/file/d/file1/view" });
    assert.equal(seen.filter((s) => s.url.endsWith("/files?fields=id") && s.init.method === "POST").length, 1, "the folder is created once");
    const upload = seen.find((s) => s.url.includes("/upload/"));
    assert.match(upload.init.headers["Content-Type"], /^multipart\/related; boundary=/);
    assert.ok(upload.init.body.toString().includes('"parents":["folder1"]'));
    assert.ok(upload.init.body.toString().includes("%PDF-1.4 hi"));
  });

  it("uploads straight into a given Drive folder and asks for full Drive access only then", async () => {
    const { doFetch, seen } = scripted([token, ["/upload/drive/v3/files", { method: "POST", body: { id: "f9", webViewLink: "link" } }]]);
    const g = createGoogle(cfg({ google: { driveFolderId: "folderABC" } }), { fetch: doFetch });
    await g.uploadResume({ name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 x") });
    assert.equal(seen.filter((s) => s.url.startsWith("https://www.googleapis.com/drive/v3/files")).length, 0, "no folder is searched for or created");
    assert.ok(seen.find((s) => s.url.includes("/upload/")).init.body.toString().includes('"parents":["folderABC"]'));
    assert.ok(googleScopes({ driveFolderId: "x" }).includes("https://www.googleapis.com/auth/drive"));
    assert.ok(!googleScopes({ driveFolderId: "x" }).some((scope) => /calendar/.test(scope)), "no calendar permission is requested");
    assert.ok(googleScopes({}).includes("https://www.googleapis.com/auth/drive.file"));
    assert.ok(!googleScopes({}).includes("https://www.googleapis.com/auth/drive"));
  });

  it("checks the Drive folder and Gmail separately", async () => {
    const { doFetch } = scripted([
      token,
      ["/drive/v3/files/folderABC", { body: { name: "Resumes", mimeType: "application/vnd.google-apps.folder", capabilities: { canAddChildren: true }, owners: [{ emailAddress: "team@example.com" }] } }],
      ["/gmail/v1/users/me/profile", { status: 403, body: { error: { message: "Gmail API has not been used in project" } } }],
    ]);
    const r = await createGoogle(cfg({ google: { driveFolderId: "folderABC" } }), { fetch: doFetch }).check();
    assert.equal(r.calendar, undefined, "there is no calendar any more");
    assert.match(r.drive.detail, /folder "Resumes", owned by team@example\.com/);
    assert.equal(r.gmail.ok, false);
    assert.match(r.gmail.error, /Gmail API has not been used/);
  });

  it("sends mail through the Gmail API as a base64url message", async () => {
    const { doFetch, seen } = scripted([token, ["/gmail/v1/users/me/messages/send", { method: "POST", body: { id: "m" } }]]);
    await createGoogle(cfg(), { fetch: doFetch }).sendMail({ to: "team@example.com", subject: "Hello", text: "Body text" });
    const raw = Buffer.from(JSON.parse(seen.find((s) => s.url.includes("messages/send")).init.body).raw, "base64url").toString();
    assert.match(raw, /To: team@example\.com/);
    assert.match(raw, /Subject: Hello/);
    assert.match(raw, /Body text/);
  });

  it("explains a refused sign-in and surfaces API errors", async () => {
    const bad = scripted([["oauth2.googleapis.com/token", { status: 400, body: { error: "invalid_grant", error_description: "Token has been expired or revoked." } }]]);
    await assert.rejects(createGoogle(cfg(), { fetch: bad.doFetch }).sendMail({ to: "a@b.c", subject: "s", text: "t" }), /invalid_grant/);
    const denied = scripted([token, ["/gmail/v1/users/me/messages/send", { status: 403, body: { error: { message: "Gmail API has not been used in project" } } }]]);
    await assert.rejects(createGoogle(cfg(), { fetch: denied.doFetch }).sendMail({ to: "a@b.c", subject: "s", text: "t" }), /Gmail API has not been used/);
  });
});
