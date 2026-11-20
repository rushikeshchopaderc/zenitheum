/**
 * One-time helper: connect the company Google account so the API can store resumes in Drive and send
 * notification e-mails. It prints the refresh token to paste into GOOGLE_REFRESH_TOKEN (Render dashboard / .env.local).
 *
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run google:authorize
 *
 * Needs an OAuth client of type "Desktop app" (see README, "Connect Google"). Sign in as the company account.
 */
import http from "node:http";
import { loadConfig } from "../config.js";
import { googleScopes } from "../services/google.js";

const { google } = loadConfig();
if (!google.clientId || !google.clientSecret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first (see the README, \"Connect Google\").");
  process.exit(2);
}

const PORT = 53682;
const redirect = `http://127.0.0.1:${PORT}/callback`;
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: google.clientId,
  redirect_uri: redirect,
  response_type: "code",
  scope: googleScopes(google).join(" "),
  access_type: "offline",
  prompt: "consent",
})}`;

console.log("\n1. Open this address in your browser and sign in with the company Google account:\n\n" + authUrl + "\n");
console.log(`2. Approve the two permissions (${google.driveFolderId ? "Google Drive, to store resumes in your folder" : "files this app creates"}, send mail). Waiting for Google to call back...\n`);

const code = await new Promise((resolve, reject) => {
  const server = http
    .createServer((req, res) => {
      const url = new URL(req.url, redirect);
      if (url.pathname !== "/callback") return res.writeHead(404).end();
      res.writeHead(200, { "Content-Type": "text/html" }).end("<h2>Done. You can close this tab and return to the terminal.</h2>");
      server.close();
      return url.searchParams.get("code") ? resolve(url.searchParams.get("code")) : reject(new Error(url.searchParams.get("error") || "no code returned"));
    })
    .listen(PORT, "127.0.0.1");
  setTimeout(() => reject(new Error("Timed out after 5 minutes")), 300_000).unref();
});

const response = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ code, client_id: google.clientId, client_secret: google.clientSecret, redirect_uri: redirect, grant_type: "authorization_code" }),
});
const data = await response.json();
if (!data.refresh_token) {
  console.error("Google did not return a refresh token:", data.error_description || data.error || JSON.stringify(data));
  process.exit(1);
}
const granted = String(data.scope || "").split(" ");
const missing = googleScopes(google).filter((scope) => !granted.includes(scope));
if (missing.length) {
  console.error("Google did not grant all the permissions. Missing:\n  " + missing.join("\n  ") + "\nRun this again and tick every box on the permission screen.");
  process.exit(1);
}
console.log("Success. Add this to your server's environment variables (keep it secret):\n");
console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token}\n`);
