# Database

PostgreSQL 14 or newer (production: Neon). The schema is plain SQL in `migrations/NNN_name.sql`; the API applies any pending
file when it starts (inside one transaction, under an advisory lock, so several API instances can start together).
`npm run db:migrate` does the same without starting the server.

## Tables

Six tables hold everything the website collects. There are no login, session, page-view or analytics tables.

| Table          | Holds                                          | Notes                                                                                                                                                              |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `demos`        | Demo requests                                  | customer details, `chip` (`analog`/`digital`/`both`), `analog_format` (`soft`/`hard`/`both`), `preferred_date`, `preferred_time` (`morning`/`afternoon`/`evening`), `status`, `notes` |
| `orders`       | Chip orders                                    | `contact_name`, `chip`, `analog_format`, `quantity`, `delivery_date`, `delivery_location`, `customisation`, `status`, `internal_notes`                             |
| `contacts`     | Questions and customisation requests           | name, email, phone, company, message, `topic` (`question`/`customisation`), `chip`, `analog_format`, `status`, `notes`                                              |
| `applications` | Job applications                               | `job_slug`, `track`, `status`, `notes`; the resume is **not** in the database: `resume_name`, `resume_url` (a Google Drive link) and `resume_file_id` point to it    |
| `subscribers`  | People waiting for chip release news           | unique lower-case `email`, `name`, `chip`, `analog_format`, `active` / `unsubscribed`                                                                              |
| `milestones`   | The broad milestones shown on the website      | `track`, `status`, `target_date`; `edited` stops the seed file from overwriting what you changed in the console                                                    |

Rules enforced by the database itself:

- **The delivery rule.** The analog chip (ZT-AFE1) can be delivered as soft IP, hard IP or both; the digital chip (ZT-SEC1) is licensed as soft IP only.
  `analog_format` is therefore filled for analog (and "both") requests and empty for digital ones. An order is for one chip, so `orders.chip` is `analog` or `digital`.
- Status vocabularies are `CHECK` constraints that mirror `shared/crm.js`. Every timestamp is `timestamptz` (UTC); ids that leave the system are UUIDs
  or short references like `ZT-1A2B3C4D`; no IP address is stored.

## Migrations

| File                 | What it does                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `001_init.sql`       | The original schema (contacts, applications, subscribers, milestones, plus analytics and console-login tables that were later removed).       |
| `002_simplify.sql`   | Drops the analytics, login and resume-storage tables, adds the `demos` and `orders` tables and the chip/format columns. It refuses to drop `application_files` if it still holds resumes. |
| `003_customisation.sql` | Adds `contacts.topic` and `contacts.analog_format` for customisation requests. |
| `004_demo_requests.sql` | A demo is a request, not a calendar booking: adds `demos.preferred_date` / `preferred_time` (a booked slot becomes its India date) and drops the slot, Meet-link, calendar-event and time-zone columns. |

Adding one: create `migrations/004_short_name.sql` (the next number), never edit a migration that has been applied anywhere, keep it
idempotent where cheap (`CREATE INDEX IF NOT EXISTS …`) and restart the API or run `npm run db:migrate`. `npm test` runs every migration on a fresh database.

## Looking at the data

- **Admin console** (`/admin`): demos, orders, questions, applications, subscribers, milestones, with CSV export.
- **Neon console** → your project → *Tables* (a spreadsheet view) or *SQL Editor* (type `select * from demos order by created_at desc;`).
- **Terminal:** `psql "$DATABASE_URL"`.

## Handy queries

```sql
-- Demo requests waiting for a reply
SELECT ref, name, organisation, chip, analog_format, preferred_date, preferred_time, created_at
FROM demos WHERE status = 'requested' ORDER BY created_at;

-- Open orders by delivery date
SELECT ref, organisation, contact_name, chip, analog_format, quantity, delivery_date, delivery_location, status
FROM orders WHERE status IN ('new', 'confirmed', 'in_progress') ORDER BY delivery_date;

-- Demand by chip and delivery format, across demos, orders and the release-news list
SELECT 'demo' AS source, chip, analog_format, count(*) FROM demos GROUP BY 2, 3
UNION ALL SELECT 'order', chip, analog_format, count(*) FROM orders GROUP BY 2, 3
UNION ALL SELECT 'news', chip, analog_format, count(*) FROM subscribers WHERE status = 'active' GROUP BY 2, 3
ORDER BY 1, 2, 3;

-- Applicants per role and stage
SELECT job_slug, status, count(*) FROM applications GROUP BY 1, 2 ORDER BY 1, 2;

-- Mailing list: active release-news subscribers
SELECT email, name, chip, analog_format FROM subscribers WHERE status = 'active' ORDER BY created_at;
```

## Privacy operations

- **Delete a person's records:** the delete buttons in the console (demo, order, question, application, subscriber). Deleting an application removes
  its row only; also delete the resume from the "Zenitheum applications" folder in Google Drive (`resume_url` links to it).
- **Backups:** `pg_dump "$DATABASE_URL" | gzip > zenitheum-$(date +%F).sql.gz`. Neon also keeps a short point-in-time history on the free plan.
