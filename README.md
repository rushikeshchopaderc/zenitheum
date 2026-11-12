# Zenitheum — fabless semiconductor company

Website, API and database for Zenitheum, a fabless semiconductor startup based at Dipali Nagar, Khamgaon, Maharashtra.
It designs two chips with the customers who will use them — **ZT-AFE1**, a 24-bit analog sensor front-end, and
**ZT-SEC1**, a digital secure-authentication chip — on a 13-month roadmap, December 2026 → December 2027.

It is a three-tier application. Everything the website captures — customer enquiries, job applications (with resumes),
the early-access list and consent-based visit analytics — lands in a PostgreSQL database that the team reads in a
password-protected staff console at `/admin` and exports to CSV for marketing.

```
 Tier 1 · presentation            Tier 2 · application                 Tier 3 · data
┌────────────────────────┐      ┌───────────────────────────┐      ┌──────────────────────────┐
│ React 18 SPA (Vite)    │ HTTP │ Node.js + Express 5       │  SQL │ PostgreSQL 14+           │
│  · public site         │─────▶│  routes → services →      │─────▶│  contacts · applications │
│  · staff console /admin│ /api │  repositories             │      │  subscribers · sessions  │
│ served by nginx or     │      │  validation · auth · CSV  │      │  page_views · events     │
│ by the API itself      │      │  analytics ingest · mail  │      │  milestones · admin_*    │
└────────────────────────┘      └───────────────────────────┘      └──────────────────────────┘
```

- **Front end:** React 18, Vite, Tailwind CSS, React Router. No UI, chart or animation library: visuals are Canvas, SVG and CSS.
- **API:** Node.js ≥ 20.12, Express 5. Layers: `routes/` (HTTP) → `services/` (rules) → `repositories/` (SQL). Plain SQL with bound
  parameters; no ORM.
- **Database:** PostgreSQL 14 or newer, one migration set in `database/migrations/`, applied automatically on start.
  In development, with no `DATABASE_URL`, the API uses an embedded PostgreSQL (PGlite) so `npm run dev` needs no server.

## Quick start

```bash
npm install
cp .env.example .env     # optional; set ADMIN_EMAIL + ADMIN_PASSWORD (12+ chars) to get a console login
npm run dev              # site on http://localhost:5173, API on http://localhost:8787 (Vite proxies /api)
```

Open `http://localhost:5173/admin` and sign in with the account from `.env`; the first start creates it when the database is empty. With
nothing configured, the **development** server prints a one-time login (`admin@zenitheum.local` and a random password) instead, so you are
never stuck at the login screen. (`npm run admin:create -- --email you@zenitheum.com` creates an account with a hidden password prompt, or
resets one with `--reset`; stop `npm run dev` first when using the embedded database.)

Production (one process serves site + API; PostgreSQL is **required**):

```bash
npm run build
NODE_ENV=production DATABASE_URL=postgres://user:pass@host:5432/zenitheum TRUST_PROXY=1 npm start
```

Or the whole stack in containers (nginx + API + PostgreSQL with a persistent volume):

```bash
cp .env.example .env     # set POSTGRES_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up --build        # http://localhost:8080
```

> The Docker files (`Dockerfile`, `docker-compose.yml`, `deploy/`) were written and checked for syntax but **not built or run**
> on the machine where this was developed (no Docker there). Treat the first `docker compose up` as the real test.
> Trying a production build on plain `http://localhost` in Safari? Set `ADMIN_COOKIE_SECURE=false` (it refuses Secure cookies there).

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite and the API together, with reload |
| `npm run build` / `npm start` | Production build into `dist/` / run the API (serves `dist/` with SPA fallback) |
| `npm test` | Validation, public API, analytics, admin, bootstrap and data-tier tests (in-memory PostgreSQL; see Testing) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations + seed milestones without starting the server |
| `npm run admin:create` | Create a console user, or `--reset` a password |
| `npm run inbox` | Latest enquiries, applications and sign-ups in the terminal (`-- summary` for counts) |
| `npm run db:import-legacy` | One-time import of the old `server/data/*.jsonl` files into the database |

## The staff console (`/admin`)

Sign in at `/admin`. It is never linked from the site, is `noindex`, and is not tracked by the analytics.

| Screen | What it is for |
| --- | --- |
| Overview | Visitors, sessions, leads, applications and sign-ups with change vs the previous period; trend, channels and their conversion, top pages, the visit → product page → CTA → form → submit funnel, devices, lead mix by segment and chip |
| Leads | Every enquiry with the customer segment, chip, volume and the **campaign that brought them**; status pipeline (new → contacted → qualified → won / lost / spam), notes, and the visit journey that preceded the enquiry |
| Applications | Applicants by role with their resume (downloaded through the authenticated API), pipeline status and notes |
| Subscribers | The early-access list, with unsubscribe handling |
| Visitors | Sessions with channel, landing page, pages viewed, time on site and device; custom events |
| Campaigns | UTM performance (sessions → leads → applications) and a UTM link builder with presets (LinkedIn, e-mail, WhatsApp, event QR …) |
| Audience | Devices, browsers, operating systems, languages, places, screen widths, new vs returning |
| Roadmap | Edit the status and dates of the milestones that the public milestone chart shows |
| Activity log | Who exported, deleted or changed what |

Every list exports to CSV (UTF-8 with a BOM so Excel reads non-ASCII names; cells starting with `=`, `+`, `-`, `@` are
neutralised with a leading apostrophe so a hostile "name" typed into a public form cannot run when the file is opened; the side effect is that a phone number starting with `+` shows as `'+91…`, so strip the apostrophe when importing into a CRM).

### Using the data for marketing

1. **Tag every link you share** with the UTM builder (Campaigns → *Link builder*), e.g. `…/customers?utm_source=linkedin&utm_medium=social&utm_campaign=meter-makers-nov`.
2. A visitor who accepts analytics gets a random id; when they send an enquiry or application the **channel and campaign are copied onto
   that lead**, and they stay there even after the raw visit data is deleted.
3. Filter **Leads** by segment (e.g. *Weighing-scale makers*), chip, channel or campaign and **export** the list.
4. The contact form is pre-filled by links such as `/contactus?topic=design-partner&segment=weighing&chip=analog`, so each outreach
   arrives as a pre-qualified lead.
5. SQL is also fine: see `database/README.md` for ready-made queries.

## Deploying for free (Cloudflare + Render + Neon)

```
 visitors ──▶ Cloudflare Worker (site + /api proxy) ──▶ Render (Node API) ──▶ Neon (PostgreSQL)
```

| Tier | Service | What you do |
| --- | --- | --- |
| Data | **Neon** (free Postgres) | Already created with `neon init` (project `zenitheum`, Singapore). Its connection strings are in your local `.env.local` (never committed). Open the console from `neon.com` → Projects → zenitheum. |
| API | **Render** (free web service) | Render dashboard → *New* → *Blueprint* → pick this GitHub repo (it reads `render.yaml`). Fill in `DATABASE_URL` (the **pooled** string from `.env.local`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters). Deploy, then copy the service address, e.g. `https://zenitheum-api.onrender.com`. |
| Site | **Cloudflare** | Put that address in `wrangler.jsonc` → `API_ORIGIN`, commit, push. Cloudflare's build command is `npm run build`, the deploy command `npx wrangler deploy`. Remove ADMIN_PASSWORD from Render afterwards. |

Good to know: Render's free service sleeps after ~15 minutes without traffic, so the first request afterwards takes up to a minute (the forms
show a friendly message meanwhile). The database tables are created automatically on the API's first start. Check the free-tier limits on each
provider's pricing page: they change.

**R2 is not a database.** Cloudflare R2 stores files only. It could later hold resumes if the database fills up; today they live in Postgres.

### Looking at your data (no coding needed)

- **Admin console:** `https://your-site/admin`, sign in. Leads, applications, visits, campaigns, CSV downloads.
- **Raw tables:** Neon console → your project → *Tables* (spreadsheet-like) or *SQL Editor* (type `select * from contacts;`).
- **Is the API alive?** open `https://your-site/api/health` in a browser: you should see `"status":"ok"`.
- **Logs and errors:** Render dashboard → your service → *Logs*. Cloudflare dashboard → Workers → zenitheum → *Logs*.

## Privacy by design

- Analytics are **first-party** (our server only) and **opt-in**: nothing is stored or sent until the visitor accepts the banner; Do Not Track
  and Global Privacy Control count as "no"; "Analytics settings" in the footer reverses the choice and erases the browser's id.
- No raw IP address is stored anywhere. Bots are filtered. The admin console is never tracked.
- Raw visit data is deleted after `ANALYTICS_RETENTION_DAYS` (default 540). A "right to erasure" button in the console erases one visitor.
- The privacy notice (`/privacy`) describes all of this in plain language. It is a draft — have it reviewed before relying on it.

## Security notes

- Passwords: scrypt (64 MiB, ~150 ms per check), per-user salt, constant-time compare, an unknown e-mail costs the same time as a wrong password.
- Sessions: a random 32-byte token in an `HttpOnly; SameSite=Strict; Secure` cookie scoped to `/api/admin`; only its SHA-256 is stored.
  Every state-changing request needs a custom header (CSRF), accounts lock for 15 minutes after 5 failures, sign-in is rate limited per IP,
  and every change, export and resume download is written to the audit log.
- Public endpoints: validated, length-capped, rate limited, honeypot-protected. Resumes are identified by file signature, not extension.
- The API sends a strict CSP (same-origin scripts, styles, fonts and connections only); `deploy/nginx.conf` repeats it for the container setup.

## Editing content

Almost everything you will want to change is plain data:

| To change… | Edit |
| --- | --- |
| Open roles, requirements, openings, **intern stipend** and dates | `shared/jobs.js` |
| The roadmap: steps, Gantt bars, decision gates, risks | `shared/roadmap.js` |
| **Milestones** (the done / to-come chart) | the admin console (**Roadmap**); the seed and defaults are `shared/milestones.js` |
| Address, phone, e-mails, leadership names | `shared/site.js` |
| The two chips: summaries, specs, deliverables, development path | `src/data/chips.js` |
| Customer segments, the pitch, market facts (with sources), design-partner steps, FAQ | `src/data/customers.js` |
| Contact-form choices (topics, segments, chips, volumes) | `shared/market.js` (the API validates against the same lists) |
| Tool flow, verification lists, clean-room practices | `src/data/flow.js` |
| Ecosystem orbit and the customer ticker | `src/data/ecosystem.js` |

`shared/` is imported by **both** the React app and the API, so a role added to `shared/jobs.js` appears on the careers page, gets a job
page and is accepted by the application endpoint — no second edit.

**Milestone statuses live in the database.** Edit a milestone in the console and the public chart updates immediately; a milestone you
edited there is never overwritten when `shared/milestones.js` changes, while untouched ones follow the file.

**Director's photo.** Drop an image named `susandhya.webp` (or `.jpg`, `.jpeg`, `.png`) into `src/assets/img/`; every page that shows her
switches from the placeholder to the photo (use a 4:5 portrait, about 800×1000).

All specification numbers are **design targets** and are labelled that way on the site. The market figures on the home and customer pages
are quoted from third-party sources (named on the page); re-check them before a launch.

## Project layout

```
database/migrations/   SQL schema (NNN_name.sql, applied in order, once)       → database/README.md
deploy/                nginx config for the container setup
shared/                data used by the site AND the API (site info, jobs, roadmap, milestones, market vocabulary)
server/
  app.js               Express app factory (CSP, CORS allow-list, routers, static + SPA fallback, errors)
  index.js             start-up: connect → migrate → seed → bootstrap admin → listen → retention job
  config.js            environment → configuration
  db/                  one interface over PostgreSQL (pg) and embedded PGlite; migrate.js
  routes/              public.js (site) · admin.js (console)
  services/            auth · analytics ingest (collect) · csv · date ranges · bootstrap
  repositories/        leads · analytics · reports · milestones · admin   (all SQL lives here)
  lib/                 validation · upload · mail · user-agent parsing
  scripts/             admin-create · migrate · inbox · import-legacy
  test/                *.test.js — node:test
src/
  components/          Home · Products · Customers · Roadmap · Milestones · Technology · AboutUs · Careers · ContactUs · Privacy · layout · fx
  admin/               the staff console (a lazy-loaded chunk, separate from the public site)
  data/  hooks/  lib/  (lib/analytics.js is the consent-based tracker)
```

## API

All JSON. Errors look like `{ "ok": false, "error": "validation_failed", "message": "…", "errors": { "field": "…" } }`.

| Method & path | Purpose |
| --- | --- |
| `GET /api/health` | Liveness + database check |
| `GET /api/jobs`, `/api/jobs/:slug`, `/api/roadmap`, `/api/milestones` | Public content (milestones come from the database) |
| `POST /api/contact` | `{ name, email, topic, message, consent, phone?, organisation?, jobTitle?, segment?, chip?, volume?, visitorId?, sessionId? }` |
| `POST /api/subscribe` | `{ email, source? }`: same answer whether or not the address was already listed |
| `POST /api/applications` | `multipart/form-data`: `job`, `name`, `email`, `phone`, `track?`, `organisation?`, `profile?`, `note?`, `consent`, `resume?` (PDF/DOC/DOCX ≤ 5 MB). A resume **or** a profile link is required. |
| `POST /api/collect` | Analytics beacon (`text/plain` JSON). Always `204`; ignores bots, Do Not Track and Global Privacy Control |
| `/api/admin/*` | Staff console: `login`, `logout`, `me`, `overview`, `campaigns`, `audience`, `contacts`, `applications` (+ `/resume`), `subscribers`, `sessions`, `events`, `milestones`, `export/:kind`, `audit`, `visitors/:id` |

## Configuration

Copy `.env.example` to `.env`; every variable is documented there. The ones that matter in production:

| Variable | Notes |
| --- | --- |
| `NODE_ENV=production` | Turns on HSTS, `upgrade-insecure-requests`, Secure cookies, and **requires** `DATABASE_URL` |
| `DATABASE_URL`, `DATABASE_SSL` | PostgreSQL 14+; `DATABASE_SSL=true` for managed databases that need TLS |
| `TRUST_PROXY` | Number of reverse proxies in front of the app (`1` behind nginx). Without it, all visitors share one rate-limit bucket |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Create the first console user on an empty database; remove the password afterwards |
| `ANALYTICS_RETENTION_DAYS`, `ANALYTICS_TZ` | Retention window (default 540) and the time zone "today" means in the dashboard (default `Asia/Kolkata`) |
| `SMTP_*`, `MAIL_*` | Optional e-mail notifications; without SMTP everything is still stored |

### Backups

Everything is in PostgreSQL, so one backup covers it (resumes included):

```bash
pg_dump "$DATABASE_URL" | gzip > backups/zenitheum-$(date +%F).sql.gz        # or: docker compose exec db pg_dump -U zenitheum zenitheum | gzip > …
gunzip -c backups/zenitheum-2026-12-01.sql.gz | psql "$DATABASE_URL"          # restore into an empty database
```

## Testing

```bash
npm test                                                              # in-memory PostgreSQL (PGlite): no setup
TEST_DATABASE_URL=postgres://user@localhost:5432/zt_tests npm test    # the same tests on a real PostgreSQL (it wipes that database!)
```

The suite boots the real app on an ephemeral port and covers validation, every public endpoint, the analytics pipeline
(attribution, bots, forged sessions, concurrency), the whole admin API (sign-in, lockout, CSRF, CRUD, reports, CSV), retention and migrations.
It passes on PGlite and on PostgreSQL 14.

## Browsers and devices

The public pages were checked at 280 px to 2560 px, in portrait and landscape, at device pixel ratios 1–3 (176 page/viewport combinations):
no horizontal scroll, no console errors, and interactive controls of at least 40 px on touch devices (44 px on the main controls); the staff
console was checked at 320, 360, 768 and 1440 px. Those runs used Chrome only: Safari and Firefox were **not** available to test, so check them
on a real iPhone and a Firefox desktop before launch. The CSS is written for Chrome/Edge/Firefox 90+, Safari 14.1+ and iOS 14.5+ (`browserslist`),
with fallbacks where newer features are used (`overflow: clip`, container-query units, `color-mix`, `dvh`). The site avoids newer-only CSS without a fallback, respects
`prefers-reduced-motion`, and pauses ambient animation while off-screen.

## Notes

- Sections use `overflow-clip`, not `overflow-hidden`, so `position: sticky` (the milestone and roadmap rulers) keeps working inside them.
- The embedded dev database (PGlite) can be open in only one process; a lock file prevents a second one (for example `npm run inbox` while
  `npm run dev` runs) from damaging it. Set `DATABASE_URL` to a PostgreSQL server to avoid the restriction.
