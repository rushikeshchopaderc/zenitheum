import crypto from "node:crypto";

import MailComposer from "nodemailer/lib/mail-composer/index.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR = "https://www.googleapis.com/calendar/v3";
const DRIVE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const GMAIL = "https://gmail.googleapis.com/gmail/v1";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/gmail.send",
];

/**
 * One OAuth refresh token (for the company Google account) powers three things, all over HTTPS:
 *   - createMeeting: a Calendar event with a Google Meet link, invitations e-mailed to everyone,
 *   - uploadResume:  a file in a Drive folder (the drive.file scope sees only files this app created),
 *   - sendMail:      e-mail through the Gmail API (free hosts such as Render block SMTP ports).
 * Nothing here is used unless GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN are set.
 */
export function createGoogle(config, { fetch: doFetch = globalThis.fetch, log = console } = {}) {
  const g = config.google;
  const enabled = Boolean(g.clientId && g.clientSecret && g.refreshToken);
  let token = null; // { value, expires }
  let folder = null; // memoised promise for the Drive folder id

  async function accessToken() {
    if (token && token.expires > Date.now() + 60_000) return token.value;
    const response = await doFetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: g.clientId, client_secret: g.clientSecret, refresh_token: g.refreshToken, grant_type: "refresh_token" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(`Google sign-in failed (${data.error ?? response.status}): ${data.error_description ?? "check the refresh token"}`);
    token = { value: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 };
    return token.value;
  }

  async function call(url, { method = "GET", json, body, headers = {} } = {}) {
    const response = await doFetch(url, {
      method,
      headers: { Authorization: `Bearer ${await accessToken()}`, ...(json ? { "Content-Type": "application/json" } : {}), ...headers },
      body: json ? JSON.stringify(json) : body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(`Google API ${response.status}: ${data.error?.message ?? text.slice(0, 200)}`);
    return data;
  }

  return {
    enabled,

    /** Create a Calendar event with a Meet link and e-mail the invitation (with reminders) to every attendee. */
    async createMeeting({ title, description, startIso, endIso, attendees }) {
      const params = new URLSearchParams({ conferenceDataVersion: "1", sendUpdates: "all" });
      const body = {
        summary: title,
        description,
        start: { dateTime: startIso },
        end: { dateTime: endIso },
        attendees: attendees.map((email) => ({ email })),
        conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
        reminders: { useDefault: false, overrides: [{ method: "email", minutes: 60 }, { method: "popup", minutes: 10 }] },
      };
      const url = `${CALENDAR}/calendars/${encodeURIComponent(g.calendarId)}/events`;
      let event = await call(`${url}?${params}`, { method: "POST", json: body });
      // Meet links are created asynchronously; read the event back once if the link is not there yet.
      if (!event.hangoutLink) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        event = await call(`${url}/${event.id}?conferenceDataVersion=1`);
      }
      return { meetLink: event.hangoutLink ?? null, eventId: event.id, htmlLink: event.htmlLink };
    },

    async cancelMeeting(eventId) {
      await call(`${CALENDAR}/calendars/${encodeURIComponent(g.calendarId)}/events/${eventId}?sendUpdates=all`, { method: "DELETE" });
    },

    /** Store a resume in the Drive folder (created on first use). Returns the file id and a link the team can open. */
    async uploadResume({ name, mimeType, buffer }) {
      folder ??= (async () => {
        const q = `name='${g.driveFolderName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const found = await call(`${DRIVE}/files?${new URLSearchParams({ q, fields: "files(id)", spaces: "drive" })}`);
        if (found.files?.[0]) return found.files[0].id;
        const made = await call(`${DRIVE}/files?fields=id`, { method: "POST", json: { name: g.driveFolderName, mimeType: "application/vnd.google-apps.folder" } });
        return made.id;
      })().catch((error) => {
        folder = null;
        throw error;
      });
      const parent = await folder;

      const boundary = `zt-${crypto.randomUUID()}`;
      const meta = JSON.stringify({ name, parents: [parent] });
      const payload = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
        buffer,
        Buffer.from(`\r\n--${boundary}--`),
      ]);
      const file = await call(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id,webViewLink`, {
        method: "POST",
        body: payload,
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      });
      return { fileId: file.id, url: file.webViewLink };
    },

    /** Send a plain-text e-mail (optionally with attachments) through the Gmail API. */
    async sendMail({ to, subject, text, replyTo, attachments }) {
      const raw = await new Promise((resolve, reject) =>
        new MailComposer({ from: g.teamEmail, to, subject, text, replyTo, attachments }).compile().build((error, message) => (error ? reject(error) : resolve(message)))
      );
      await call(`${GMAIL}/users/me/messages/send`, { method: "POST", json: { raw: Buffer.from(raw).toString("base64url") } });
    },

    log,
  };
}
