# Zenitheum — fabless chip company

Website, API and database for Zenitheum, an end-to-end fabless chip company. The site is a **one-page product site** that sells two chips:
**ZT-AFE1** (24-bit analog sensor front-end, delivered as soft IP, hard IP or both) and **ZT-SEC1** (digital secure-authentication core,
licensed as soft IP only), each with optional customisation. Visitors can **book a demo** (a Google Calendar event with a Google Meet link),
**place an order**, ask a question, join the chip-release-news list, or apply for a job at `/careers`.

```
 visitors ──▶ Cloudflare Worker (site + /api proxy) ──▶ Render (Node API) ──▶ Neon (PostgreSQL)
                                                              └────────────▶ Google (Calendar + Meet, Drive, Gmail)
```

- **Front end:** React 18, Vite, Tailwind CSS, React Router. No UI library; visuals are Canvas, SVG and CSS.
- **API:** Node.js ≥ 20.12, Express 5. Layers: `routes/` (HTTP) → `services/` (rules, Google) → `repositories/` (SQL). Plain SQL with bound parameters; no ORM.
- **Database:** PostgreSQL 14+, six tables (`demos`, `orders`, `contacts`, `applications`, `subscribers`, `milestones`); see [database/README.md](database/README.md).
  In development, with no `DATABASE_URL`, the API uses an embedded PostgreSQL (PGlite), so `npm run dev` needs no server.

**Internal notes that are deliberately *not* on the website:** [docs/ROADMAP.md](docs/ROADMAP.md) (the detailed plan) and
[docs/TECHNOLOGY.md](docs/TECHNOLOGY.md) (how the chips are made).

## Quick start

```bash
npm install
cp .env.example .env     # optional; every value is optional locally
npm run dev              # site on http://localhost:5173, API on http://localhost:8787 (Vite proxies /api)
```

Open `http://localhost:5173/admin`. With no `ADMIN_EMAIL`/`ADMIN_PASSWORD` set, the **development** server prints a one-time login
(`admin@zenitheum.local` and a random password) when it starts. Without Google credentials, a booked demo is stored with status
*requested* and no Meet link; everything else works.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite and the API together, with reload |
| `npm run build` / `npm start` | Production build into `dist/` / run the API (serves `dist/` with SPA fallback) |
| `npm test` | Validation, public API, demo slots, orders, admin and database tests (in-memory PostgreSQL; see Testing) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations + seed milestones without starting the server |
| `npm run google:authorize` | One-time: connect the company Google account and print the refresh token |
| `npm run google:check` | Check the Google connection (`-- --email`, `-- --meet` also send a test e-mail / create a test Meet link) |
| `npm run inbox` | Latest demos, orders, questions, applications and sign-ups in the terminal (`-- summary` for counts) |

## Deploying for free (Cloudflare + Render + Neon)

| Tier | Service | What you do |
| --- | --- | --- |
| Data | **Neon** (free Postgres) | Project `zenitheum` (Singapore). Its connection strings are in your local `.env.local` (never committed). Neon console → Projects → zenitheum. |
| API | **Render** (free web service) | Dashboard → *New* → *Blueprint* → pick this GitHub repo (it reads `render.yaml`). Fill in `DATABASE_URL` (the **pooled** Neon string), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters) and the three `GOOGLE_*` values (next section). Deploy, then copy the service address, e.g. `https://zenitheum-api.onrender.com`. |
| Site | **Cloudflare** (Workers or Pages) | Build command `npm run build`. Workers: deploy command `npx wrangler deploy` (uses `worker/index.js`). Pages (an address ending in `.pages.dev`): output directory `dist`; the `functions/` folder forwards `/api/*`. Both forward to `https://zenitheum-api.onrender.com` unless you set `API_ORIGIN` (`wrangler.jsonc` for Workers, project variables for Pages). |

Render's free service sleeps after ~15 minutes without traffic, so the first request afterwards takes up to a minute (the forms retry and show a
friendly message meanwhile). The tables are created automatically on the API's first start. Free-tier limits change; check each provider's pricing page.

### Connect Google (calendar + Meet link, resumes, notification e-mail)

The API uses **one** company Google account (zenitheumsolutions@gmail.com) for three things, all over HTTPS: a Calendar event with a Google Meet link for every demo
(Google e-mails the invitation and reminders to the customer and the team), a Drive folder for uploaded résumés, and Gmail for notifications (free hosts such as
Render block SMTP). The full, click-by-click guide, including where the client ID and secret come from, is **[docs/GOOGLE_SETUP.md](docs/GOOGLE_SETUP.md)**.
In short: create a Google Cloud project, enable the Calendar, Drive and Gmail APIs, publish the consent screen (**In production**, not *Testing*), create a **Desktop app**
client, run `npm run google:authorize`, check with `npm run google:check -- --email --meet`, then set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_REFRESH_TOKEN` and `GOOGLE_DRIVE_FOLDER_ID` on Render.

The integration is written against Google's documented REST APIs and covered by tests with a fake Google, but it has **not** been run against a real Google account from
this repository, so run the check above and book a test demo with your own e-mail address right after set-up. If something is misconfigured the booking is still saved
(status *requested*), the customer still sees their confirmation, and the Render logs say what Google replied.

### Looking at your data (no coding needed)

- **Admin console:** `https://your-site/admin`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Demos, orders, questions, applications, subscribers, milestones, CSV downloads.
- **Raw tables:** Neon console → your project → *Tables* (spreadsheet-like) or *SQL Editor* (type `select * from demos;`). Ready-made queries are in `database/README.md`.
- **Resumes:** open the *Zenitheum applications* folder in Google Drive (or use the link in the application's page in the console).
- **Is the API alive, and is the site connected to it?** open `https://your-site/api/health` in a browser: you should see `"status":"ok"`. If you see a web page instead, the site is not forwarding `/api/*` to Render: forms and the demo calendar will fail.
- **Logs and errors:** Render dashboard → your service → *Logs*. Cloudflare dashboard → Workers → zenitheum → *Logs*.

## What the visitor can do

| On the site | What happens |
| --- | --- |
| **Book a demo** (`#demo`) | Picks a 30-minute slot (Monday–Friday, 10:00–18:00 IST, at least 12 hours ahead, three weeks out), fills in their details and which chip and delivery format they care about. The slot is reserved in the database (it cannot be double-booked), a Calendar event with a Meet link is created, and the customer and `zenitheumsolutions@gmail.com` are invited. |
| **Book an order** (`#order`) | Chip, delivery format, quantity, delivery date and location, customisation, contact person. Stored in `orders`; the team is notified. |
| **Ask a question** (`#ask`) | Stored in `contacts`; the team is notified. |
| **Customise a chip** (floating button, every public page; or a link ending `#customise`, e.g. `/?chip=analog#customise`) | A panel with the value pitch and a short form: chip, delivery format (ZT-AFE1) and what to change. Stored in `contacts` with `topic = customisation`; the team is notified. |
| **Chip release news** | E-mail (plus optional name, chip, delivery format) in `subscribers`. |
| **Apply** (`/careers`) | Stored in `applications`; the resume goes to Google Drive and only its link is stored. |

**Delivery rule** (enforced by the API and the database): the analog chip is delivered as soft IP, hard IP or both; the digital chip is licensed as soft IP only.
Forms ask the delivery format whenever the analog chip is involved.

Links can pre-fill the demo form: `/?segment=weighing&chip=analog#demo`. Segment ids are in `src/data/customers.js`.

## Staff console (`/admin`)

Never linked from the site and `noindex`. One account, read from the environment (no user table); the session is a signed `HttpOnly; SameSite=Strict` cookie.
Every list can be filtered, searched and exported to CSV (UTF-8 with a BOM so Excel reads non-ASCII names; cells starting with `=`, `+`, `-`, `@`
get a leading apostrophe so a hostile "name" typed into a public form cannot run when the file is opened).

| Screen | What it is for |
| --- | --- |
| Overview | Counts and what needs attention: upcoming demos, new orders, unanswered questions, new applications, subscribers |
| Demos | Upcoming and past demos with the Meet link (open, copy, or **Create Meet link** if Google was unavailable when it was booked), status (requested → scheduled → completed / cancelled / no show), notes |
| Orders | Orders with delivery date and location, status (new → confirmed → in progress → delivered / cancelled), internal notes |
| Questions | Questions and customisation requests (filter by type) |
| Applications | Applicants by role, the resume link, status and notes |
| Subscribers | The release-news list by chip and delivery format, unsubscribe handling |
| Roadmap | The status and dates of the broad milestones the website shows |

## Editing content

| To change… | Edit |
| --- | --- |
| Open roles (one posting per skill, tied to a chip), requirements, **internship start, length and stipend** | `shared/jobs.js` |
| **Milestones** on the website | the admin console (Roadmap); the seed and defaults are `shared/milestones.js` |
| Phone, e-mail, leadership names | `shared/site.js` |
| The two chips: one-line pitch, how each works and plugs into the customer's device, delivery formats | `src/data/chips.js` |
| Ideal customers (in order), the customisation pitch, market facts | `src/data/customers.js` |
| Form choices (segments, chips, formats, order sizes) | `shared/market.js` (the API validates against the same lists) |
| Demo hours, slot length, notice, horizon | `.env` (`DEMO_*`) |

`shared/` is imported by **both** the React app and the API, so a role added to `shared/jobs.js` appears on the careers page, gets a job page and is accepted
by the application endpoint. All specification numbers are **design targets** and are labelled that way on the site.

**Director's photo.** Drop an image named `susandhya.webp` (or `.jpg`, `.jpeg`, `.png`) into `src/assets/img/`; the About section switches from the placeholder to the photo (use a 4:5 portrait, about 800×1000).

## Project layout

```
database/migrations/   SQL schema (NNN_name.sql, applied in order, once)       → database/README.md
docs/                  ROADMAP.md · TECHNOLOGY.md (internal, not on the site) · GOOGLE_SETUP.md (connect Google)
deploy/                nginx config for the container setup
worker/  functions/    Cloudflare Worker (and the Pages Function that does the same): proxy /api to Render
shared/                data used by the site AND the API (site info, jobs, milestones, form vocabulary, status lists)
server/
  app.js  index.js     Express app factory · start-up: connect → migrate → seed milestones → listen
  config.js            environment → configuration
  db/                  one interface over PostgreSQL (pg) and embedded PGlite; migrate.js
  routes/              public.js (site) · admin.js (console)
  services/            auth · google (Calendar/Meet, Drive, Gmail) · slots · csv
  repositories/        demos · orders · leads (contacts, applications, subscribers) · milestones · overview   (all SQL lives here)
  lib/                 validation · upload · mail · errors
  scripts/             migrate · inbox · google-authorize
  test/                *.test.js — node:test
src/
  components/Home/     the one page: Hero · Products · Customers · Milestones · Start (demo / order / question) · About
  components/Customise/ the floating "Customise a chip" button and its panel (on every public page)
  components/forms/    DemoForm · SlotPicker · OrderForm · QuestionForm · SubscribeForm · ApplicationForm
  components/Careers/  /careers and the job pages
  admin/               the staff console (a lazy-loaded chunk, separate from the public site)
  data/  hooks/  lib/
```

Old addresses (`/products`, `/customers`, `/roadmap`, `/technology`, `/about-us`, `/contactus`) redirect to the matching section of the home page.

## API

All JSON. Errors look like `{ "ok": false, "error": "validation_failed", "message": "…", "errors": { "field": "…" } }`.

| Method & path | Purpose |
| --- | --- |
| `GET /api/health` | Liveness + database check |
| `GET /api/jobs`, `/api/jobs/:slug`, `/api/milestones` | Public content (milestones come from the database) |
| `GET /api/demos/slots` | Free demo slots for the next weeks: only `{ start, available }`, nothing about other bookings |
| `POST /api/demos` | `{ name, email, phone, organisation, chip, slot, consent, jobTitle?, segment?, analogFormat?, message?, visitorTimezone? }` → `{ ok, id, scheduled, meetLink, slot }` (`409 slot_taken` if someone was faster) |
| `POST /api/orders` | `{ contactName, email, phone, organisation, chip, quantity, deliveryDate, deliveryLocation, consent, analogFormat?, jobTitle?, customisation?, notes? }` |
| `POST /api/contact` | `{ name, email, phone?, organisation?, jobTitle?, message, consent }` |
| `POST /api/subscribe` | `{ email, name?, chip?, analogFormat?, source? }`: same answer whether or not the address was already listed |
| `POST /api/applications` | `multipart/form-data`: `job`, `name`, `email`, `phone`, `track?`, `organisation?`, `profile?`, `note?`, `consent`, `resume?` (PDF/DOC/DOCX ≤ 5 MB). A resume **or** a profile link is required. |
| `/api/admin/*` | Staff console: `login`, `logout`, `me`, `overview`, `demos`, `orders`, `contacts`, `applications`, `subscribers`, `milestones`, `export/:kind` |

## Configuration

Copy `.env.example` to `.env`; every variable is documented there. The ones that matter in production:

| Variable | Notes |
| --- | --- |
| `NODE_ENV=production` | Turns on HSTS, Secure cookies, and **requires** `DATABASE_URL` |
| `DATABASE_URL`, `DATABASE_SSL` | PostgreSQL 14+ (Neon: the pooled string) |
| `TRUST_PROXY` | Number of reverse proxies in front of the app (`2` for Cloudflare Worker + Render, `1` behind nginx). Without it, all visitors share one rate-limit bucket |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The one console login (password 12+ characters) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Calendar + Meet, Drive, Gmail. See "Connect Google". Without them: no Meet links, no resume upload in production |
| `GOOGLE_DRIVE_FOLDER_ID` | The Drive folder résumés are stored in (the part of the folder's address after `/folders/`) |
| `TEAM_EMAIL` | Invited to every demo and notified of every submission (default `zenitheumsolutions@gmail.com`) |
| `DEMO_*` | Demo hours, slot length, notice and horizon |
| `SMTP_*`, `MAIL_*` | Optional fallback e-mail if you host somewhere that allows SMTP |

## Security notes

- Console: one account from the environment, compared in constant time; the session is an HMAC-signed `HttpOnly; SameSite=Strict; Secure` cookie scoped to `/api/admin`;
  every state-changing request needs a custom header (CSRF); sign-in is throttled per IP. Changing `ADMIN_PASSWORD` (or `SESSION_SECRET`) signs everyone out.
- Public endpoints: validated, length-capped, rate limited, honeypot-protected. Resumes are identified by file signature, not extension.
- The demo calendar never exposes who booked a slot, and the database refuses a second booking of the same slot even under a race.
- The API sends a strict CSP (same-origin scripts, styles, fonts and connections only); `deploy/nginx.conf` repeats it for the container setup.
- **Never commit secrets.** Connection strings and Google credentials belong in `.env.local` (git-ignored) and the Render dashboard. If a secret was ever committed, treat it as leaked and rotate it.

## Testing

```bash
npm test                                                              # in-memory PostgreSQL (PGlite): no setup
TEST_DATABASE_URL=postgres://user@localhost:5432/zt_tests npm test    # the same tests on a real PostgreSQL (it wipes that database!)
```

The suite boots the real app on an ephemeral port and covers validation, every public endpoint, demo slot rules and double booking, the delivery rule,
the Google client (against a fake), the whole admin API (sign-in, CSRF, CRUD, CSV), the Cloudflare Worker's proxying and the migrations.

## Browsers and devices

The public page was checked in Chrome at phone, tablet and desktop widths with no horizontal scroll and no console errors. Safari and Firefox were **not** available to test:
check them on a real iPhone and a Firefox desktop before launch. The CSS targets Chrome/Edge/Firefox 90+, Safari 14.1+ and iOS 14.5+ (`browserslist`), respects
`prefers-reduced-motion`, and pauses ambient animation while off-screen.

The Docker files (`Dockerfile`, `docker-compose.yml`, `deploy/`) were written but **not built or run** on the machine where this was developed; treat the first `docker compose up` as the real test.

## Notes

- Sections use `overflow-clip`, not `overflow-hidden`, so `position: sticky` keeps working inside them.
- The embedded dev database (PGlite) can be open in only one process; a lock file prevents a second one (for example `npm run inbox` while `npm run dev` runs) from damaging it.
  Set `DATABASE_URL` to a PostgreSQL server to avoid the restriction.
