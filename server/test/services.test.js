import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadConfig } from "../config.js";
import { checkCredentials, createThrottle, signSession, verifySession } from "../services/auth.js";
import { createGoogle } from "../services/google.js";
import { listSlots, matchSlot, todayIn } from "../services/slots.js";

const cfg = (extra = {}) => loadConfig({ NODE_ENV: "test" }, { admin: { email: "a@example.com", password: "a long enough password", ...extra.admin }, google: { clientId: "id", clientSecret: "secret", refreshToken: "refresh", ...extra.google } });

describe("demo slots", () => {
  const { demo } = cfg();
  // Thursday 2026-11-19 09:00 IST
  const now = new Date("2026-11-19T03:30:00Z");

  it("are weekday half-hours between 10:00 and 18:00 IST, at least 12 hours ahead, for 21 days", () => {
    const slots = listSlots(demo, now);
    assert.ok(slots[0] > new Date(now.getTime() + 12 * 3600_000 - 1));
    // now = Thu 09:00 IST; +12 h = Thu 21:00 IST (after hours), so the first slot is Fri 10:00 IST = 04:30 UTC
    assert.equal(slots[0].toISOString(), "2026-11-20T04:30:00.000Z");
  });

  it("skip weekends, and the last slot of a day starts at 17:30", () => {
    const slots = listSlots(demo, now);
    const ist = slots.map((s) => new Date(s.getTime() + 330 * 60_000));
    assert.ok(ist.every((d) => d.getUTCDay() >= 1 && d.getUTCDay() <= 5));
    assert.ok(ist.some((d) => d.getUTCHours() === 17 && d.getUTCMinutes() === 30));
    assert.ok(!ist.some((d) => d.getUTCHours() >= 18 || d.getUTCHours() < 10));
    assert.ok(slots.at(-1) < new Date(now.getTime() + 22 * 86_400_000));
  });

  it("match only exact slots", () => {
    const first = listSlots(demo, now)[0];
    assert.equal(matchSlot(demo, first.toISOString(), now).end - matchSlot(demo, first.toISOString(), now).start, 30 * 60_000);
    assert.equal(matchSlot(demo, new Date(first.getTime() + 60_000).toISOString(), now), null);
    assert.equal(matchSlot(demo, "garbage", now), null);
    assert.equal(matchSlot(demo, undefined, now), null);
    assert.equal(todayIn(demo, new Date("2026-11-19T20:00:00Z")), "2026-11-20", "India is already on the next day");
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

  it("creates a Meet event, invites everyone and sets reminders", async () => {
    const { doFetch, seen } = scripted([token, ["/calendar/v3/calendars/primary/events", { method: "POST", body: { id: "evt1", hangoutLink: "https://meet.google.com/aaa-bbbb-ccc", htmlLink: "h" } }]]);
    const g = createGoogle(cfg(), { fetch: doFetch });
    const r = await g.createMeeting({ title: "Demo", description: "d", startIso: "2026-12-01T04:30:00.000Z", endIso: "2026-12-01T05:00:00.000Z", attendees: ["c@x.com", "zenitheumsolutions@gmail.com"] });
    assert.equal(r.meetLink, "https://meet.google.com/aaa-bbbb-ccc");
    const call = seen.find((s) => s.url.includes("/events"));
    assert.match(call.url, /conferenceDataVersion=1/);
    assert.match(call.url, /sendUpdates=all/);
    assert.equal(call.init.headers.Authorization, "Bearer AT");
    const body = JSON.parse(call.init.body);
    assert.deepEqual(body.attendees, [{ email: "c@x.com" }, { email: "zenitheumsolutions@gmail.com" }]);
    assert.equal(body.conferenceData.createRequest.conferenceSolutionKey.type, "hangoutsMeet");
    assert.ok(body.reminders.overrides.some((o) => o.method === "email"), "an e-mail reminder goes out before the call");
    assert.equal(seen.filter((s) => s.url.includes("oauth2")).length, 1);
  });

  it("reads the event back when the Meet link is created asynchronously", async () => {
    let reads = 0;
    const { doFetch } = scripted([token, ["/events/evt2", { method: "GET", body: () => (reads += 1, { id: "evt2", hangoutLink: "https://meet.google.com/late" }) }], ["/events", { method: "POST", body: { id: "evt2" } }]]);
    const r = await createGoogle(cfg(), { fetch: doFetch }).createMeeting({ title: "t", description: "d", startIso: "a", endIso: "b", attendees: ["x@y.z"] });
    assert.equal(r.meetLink, "https://meet.google.com/late");
    assert.equal(reads, 1);
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
    await assert.rejects(createGoogle(cfg(), { fetch: bad.doFetch }).createMeeting({ title: "t", description: "d", startIso: "a", endIso: "b", attendees: [] }), /invalid_grant/);
    const denied = scripted([token, ["/events", { status: 403, body: { error: { message: "Calendar API has not been used in project" } } }]]);
    await assert.rejects(createGoogle(cfg(), { fetch: denied.doFetch }).createMeeting({ title: "t", description: "d", startIso: "a", endIso: "b", attendees: [] }), /Calendar API has not been used/);
  });
});
