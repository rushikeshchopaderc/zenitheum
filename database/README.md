# Database

PostgreSQL 14 or newer. The schema is plain SQL in `migrations/NNN_name.sql`; the API applies any pending file on start
(inside one transaction, under an advisory lock, so several API instances can start together). `npm run db:migrate` does the
same without starting the server.

## Adding a migration

1. Create `migrations/002_short_name.sql` (the next number). Never edit a migration that has been applied anywhere.
2. Keep it idempotent where cheap (`CREATE INDEX IF NOT EXISTS …`) and additive where possible.
3. Restart the API, or run `npm run db:migrate`. `npm test` runs every migration on a fresh database.

## Tables

| Table                                              | Holds                                                 | Notes                                                                                                                                                                                   |
| -------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contacts`                                       | Enquiries from prospective customers                  | `topic`, `segment`, `chip`, `volume`, pipeline `status`, `notes`; marketing attribution copied from the visit (`channel`, `utm_*`, `referrer_host`, `landing_path`) |
| `applications`                                   | Job applications                                      | `job_slug`, `track`, pipeline `status`, `notes`, same attribution columns                                                                                                       |
| `application_files`                              | The uploaded resume (`bytea`)                       | One per application; deleted with it; SHA-256 stored                                                                                                                                    |
| `subscribers`                                    | The early-access list                                 | e-mail unique and lower-case; `active` / `unsubscribed`                                                                                                                             |
| `visitors`                                       | One row per browser that accepted analytics           | random id, first-touch channel / campaign                                                                                                                                               |
| `sessions`                                       | One row per visit (30 minutes of inactivity ends one) | channel, UTM, device, browser, OS, screen, language, time zone                                                                                                                          |
| `page_views`                                     | Pages viewed in a session                             | path, title, time on page, deepest scroll                                                                                                                                               |
| `events`                                         | Named actions                                         | `cta_click`, `form_start`, `form_submit`, `form_error` … with small JSON `props`                                                                                             |
| `milestones`                                     | The public milestone chart                            | status and dates edited in the console; `edited` stops re-seeding from overwriting them                                                                                               |
| `admin_users`, `admin_sessions`, `audit_log` | Console access                                        | password hash (scrypt), only the SHA-256 of each session token, every sensitive action                                                                                                  |

Conventions: ids that leave the system are UUIDs; every timestamp is `timestamptz` (UTC); no raw IP address is stored anywhere; a lead
copies its attribution at insert time so reports survive the analytics retention window; status vocabularies are enforced by `CHECK`
constraints that mirror `shared/crm.js`.

## Marketing queries

Run them with `psql "$DATABASE_URL"` (or from a BI tool). Time zone: India.

```sql
-- Which campaigns produce leads? (last 90 days)
SELECT utm_campaign, utm_source, count(*) AS leads
FROM contacts
WHERE created_at > now() - interval '90 days' AND status <> 'spam' AND utm_campaign IS NOT NULL
GROUP BY 1, 2 ORDER BY leads DESC;

-- Leads by customer segment and chip, with how many reached "qualified" or better
SELECT segment, chip, count(*) AS leads,
       count(*) FILTER (WHERE status IN ('qualified', 'won')) AS qualified
FROM contacts WHERE status <> 'spam'
GROUP BY 1, 2 ORDER BY leads DESC;

-- Which channel brings the visitors who convert? (sessions vs leads, last 30 days)
SELECT s.channel,
       count(*) AS sessions,
       count(*) FILTER (WHERE EXISTS (SELECT 1 FROM contacts c WHERE c.session_id = s.id)) AS leads,
       round(100.0 * count(*) FILTER (WHERE EXISTS (SELECT 1 FROM contacts c WHERE c.session_id = s.id)) / count(*), 1) AS pct
FROM sessions s WHERE s.started_at > now() - interval '30 days'
GROUP BY 1 ORDER BY sessions DESC;

-- Applicants per role and stage
SELECT job_title, status, count(*) FROM applications GROUP BY 1, 2 ORDER BY 1, 2;

-- A mailing list: active subscribers plus qualified leads (de-duplicated)
SELECT email FROM subscribers WHERE status = 'active'
UNION
SELECT email FROM contacts WHERE status IN ('qualified', 'won')
ORDER BY 1;

-- What did a lead read before writing? (replace the reference)
SELECT pv.occurred_at, pv.path, pv.duration_ms
FROM contacts c JOIN page_views pv ON pv.session_id = c.session_id
WHERE c.ref = 'ZT-1A2B3C4D' ORDER BY pv.occurred_at;
```

## Privacy operations

- **Erase one person's browsing data:** *Leads → a lead → Erase browsing data* in the console (or `DELETE /api/admin/visitors/:id`).
  The enquiry itself stays, minus the link to the visit.
- **Delete a lead or application entirely:** the delete buttons in the console; the resume goes with its application.
- **Retention:** the API deletes sessions (and their page views and events) older than `ANALYTICS_RETENTION_DAYS` every six hours.


For Neon, use the password as Rcrush@zenitheum1
