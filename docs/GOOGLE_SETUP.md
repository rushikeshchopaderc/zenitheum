# Connecting Google (zenitheumsolutions@gmail.com)

What this gives the website, using the **one** company Google account:

| Feature | Google service | Where it shows up |
| --- | --- | --- |
| A demo booking becomes a calendar event with a **Google Meet link**; the customer and the team are invited and reminded | Google Calendar | Calendar of zenitheumsolutions@gmail.com, the invitation e-mails |
| Résumés and other applicant files are stored as files | Google Drive | the folder you shared (`GOOGLE_DRIVE_FOLDER_ID`) |
| Notifications to the team and confirmations to customers | Gmail | the Sent folder of zenitheumsolutions@gmail.com |

Nothing here costs money. You only need to do it once, and it takes about 15 minutes. Do every step **signed in as zenitheumsolutions@gmail.com**
(not your personal account): the website will act as that account.

## 1. Create a Google Cloud project

1. Open <https://console.cloud.google.com> and sign in as **zenitheumsolutions@gmail.com**. Accept the terms if asked.
2. Click the project picker at the top (next to the Google Cloud logo) → **New project** → name it `Zenitheum website` → **Create**. Make sure it is the selected project.

## 2. Switch on the three APIs

Open each link below (with the new project selected) and press **Enable**:

- Google Calendar API: <https://console.cloud.google.com/apis/library/calendar-json.googleapis.com>
- Google Drive API: <https://console.cloud.google.com/apis/library/drive.googleapis.com>
- Gmail API: <https://console.cloud.google.com/apis/library/gmail.googleapis.com>

## 3. Set up the consent screen ("Google Auth Platform")

This is the screen Google shows once, when you let the website use the account.

1. Menu (☰) → **APIs & Services** → **OAuth consent screen** (it opens *Google Auth Platform*) → **Get started**.
2. App name: `Zenitheum website`. User support email: zenitheumsolutions@gmail.com. → Next.
3. Audience: **External** → Next. Contact email: zenitheumsolutions@gmail.com → Next → tick the agreement → **Create**.
4. Left menu → **Data Access** → **Add or remove scopes**, and add these three (search for them, or paste into "Manually add scopes"), then **Update** and **Save**:
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/drive`
5. Left menu → **Audience** → **Publish app** → **Confirm**. The status must read **In production**.
   > **Why this matters:** while the app is in *Testing*, Google deletes its access after **7 days**, and demos would silently stop getting Meet links.
   > Publishing does not make anything public; only people you give the connection to can use it. Because the app is not verified by Google you will
   > see a "Google hasn't verified this app" warning once in step 5. That is expected for your own account.

## 4. Create the client ID and secret

This is where the **client ID** and **client secret** come from.

1. Left menu → **Clients** → **Create client**.
2. Application type: **Desktop app**. Name: `Zenitheum website`. → **Create**.
3. A box shows the **Client ID** (ends in `.apps.googleusercontent.com`) and the **Client secret**. Copy both (or **Download JSON**). Keep the secret private.

## 5. Find the Drive folder id

Open the folder in Drive. The address looks like `https://drive.google.com/drive/folders/1u-mlmtivQMCM6WVFl9yZZtvyI8abzwQi`.
The **folder id** is the part after `/folders/` (stop at any `?`): `1u-mlmtivQMCM6WVFl9yZZtvyI8abzwQi`.

The folder must belong to (or be editable by) zenitheumsolutions@gmail.com. Anyone else you want to see the résumés (for example your own account) is added
through Drive's **Share** button, not through the website.

## 6. Let the website in (get the refresh token)

On your computer, in the project folder (`npm install` once if you have not):

```bash
GOOGLE_CLIENT_ID="paste-client-id" GOOGLE_CLIENT_SECRET="paste-secret" GOOGLE_DRIVE_FOLDER_ID="1u-mlmtivQMCM6WVFl9yZZtvyI8abzwQi" npm run google:authorize
```

1. It prints an address. Open it in your browser.
2. Choose **zenitheumsolutions@gmail.com**.
3. You see *"Google hasn't verified this app"*. Click **Advanced** → **Go to Zenitheum website (unsafe)**. (It is your own app.)
4. Tick **every** permission (calendar events, Google Drive, send e-mail) → **Continue**.
5. The browser says "Done". The terminal prints a line `GOOGLE_REFRESH_TOKEN=…`. Copy it. Treat it like a password.

## 7. Check it works (on your computer)

Put the four values in a file called `.env.local` in the project folder (it is git-ignored, so it is never uploaded):

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=1u-mlmtivQMCM6WVFl9yZZtvyI8abzwQi
```

Then run:

```bash
npm run google:check -- --email --meet
```

You should see `OK` for Calendar, Drive (it names your folder) and Gmail, a test e-mail in zenitheumsolutions@gmail.com, and a Meet link. The test calendar event is deleted straight away.

## 8. Give the live website the same values

Render dashboard → your service `zenitheum-api` → **Environment** → add these four variables (same values as above) → **Save changes**. Render redeploys by itself.

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID`

Test it for real: on the live site, book a demo with your personal e-mail address. Within a minute you should get a Google Calendar invitation with a Meet link, and the demo
should show as *Scheduled* in `/admin`. Submit a test application with a résumé and check that a file appears in the Drive folder.

## If something goes wrong

| Message | Cause and fix |
| --- | --- |
| `invalid_grant` ("Token has been expired or revoked") | The app was left in *Testing*, or access was removed. Publish the app (step 3.5), then repeat step 6 and update `GOOGLE_REFRESH_TOKEN`. |
| "Access blocked … has not completed the Google verification process" / `access_denied` | The app is in *Testing* and your account is not a test user. Publish it (step 3.5). |
| `redirect_uri_mismatch` | The client was created as "Web application". Create a **Desktop app** client (step 4). |
| `Google API 403 … API has not been used in project` | One of the three APIs is not enabled (step 2). Wait a minute after enabling. |
| `File not found: <folder id>` (Drive) | The token only has the narrow Drive permission, or the account cannot open the folder. Run step 6 again **with `GOOGLE_DRIVE_FOLDER_ID` set**, and check the folder is shared with / owned by zenitheumsolutions@gmail.com. |
| "Google did not return a refresh token" | Google only gives one on the first approval. Open <https://myaccount.google.com/permissions>, remove *Zenitheum website*, and repeat step 6. |
| The demo is saved but has no Meet link | Google was not reachable or not set up. Open the demo in `/admin` and press **Create Meet link**; the Render logs show what Google answered. |

## What the permissions allow (so you can decide)

- **Calendar events**: create and delete events on the calendar. It cannot read your other calendars' settings.
- **Send e-mail**: send messages only. It cannot read your inbox.
- **Google Drive (full)**: needed to write into a folder you created by hand. It means the token could in principle read every file in that Drive, so keep the
  refresh token secret, and keep anything unrelated out of the company Drive. If you prefer the narrower permission, leave `GOOGLE_DRIVE_FOLDER_ID` empty:
  the website then creates and uses its own folder called *Zenitheum applications* instead.
