/**
 * Checks the Google connection without changing anything: can the stored token reach the Drive folder and Gmail?
 *
 *   npm run google:check                  read-only checks
 *   npm run google:check -- --email       also send a test e-mail to TEAM_EMAIL
 *
 * Reads GOOGLE_* from .env / .env.local (or the environment).
 */
import { loadConfig } from "../config.js";
import { createGoogle } from "../services/google.js";
import { flag } from "./_boot.js";

const config = loadConfig();
const google = createGoogle(config);
if (!google.enabled) {
  console.error("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN are not all set. See docs/GOOGLE_SETUP.md.");
  process.exit(2);
}

let failed = false;
const line = (label, ok, text) => {
  if (!ok) failed = true;
  console.log(`${ok ? "OK  " : "FAIL"}  ${label.padEnd(9)} ${text}`);
};

const result = await google.check();
line("Drive", result.drive.ok, result.drive.detail ?? result.drive.error);
line("Gmail", result.gmail.ok, result.gmail.detail ?? result.gmail.error);

if (flag("email")) {
  try {
    await google.sendMail({ to: config.google.teamEmail, subject: "Zenitheum website: Google connection test", text: "If you can read this, the website can send e-mail through Gmail." });
    line("Test mail", true, `sent to ${config.google.teamEmail}`);
  } catch (error) {
    line("Test mail", false, error.message);
  }
}

process.exit(failed ? 1 : 0);
