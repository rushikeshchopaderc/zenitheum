-- Zenitheum data tier — initial schema (PostgreSQL 14+).
--
-- Conventions
--   * ids that leave the system are uuids; high-volume log tables use bigserial and never expose their id
--   * every timestamp is timestamptz (stored in UTC); dates the business edits are plain `date`
--   * no raw IP addresses are stored anywhere
--   * lead rows copy their marketing attribution at insert time, so reports survive analytics retention

-- ---------------------------------------------------------------------------------------------
-- Website activity (first-party analytics; collected only with the visitor's consent)
-- ---------------------------------------------------------------------------------------------

CREATE TABLE visitors (
  id                   uuid PRIMARY KEY,
  first_seen_at        timestamptz NOT NULL DEFAULT now(),
  last_seen_at         timestamptz NOT NULL DEFAULT now(),
  sessions_count       integer     NOT NULL DEFAULT 0,
  first_channel        text,
  first_referrer_host  text,
  first_utm_source     text,
  first_utm_medium     text,
  first_utm_campaign   text,
  first_landing_path   text,
  country              text,
  timezone             text,
  language             text
);

CREATE TABLE sessions (
  id                uuid PRIMARY KEY,
  visitor_id        uuid        NOT NULL REFERENCES visitors (id) ON DELETE CASCADE,
  started_at        timestamptz NOT NULL,
  last_activity_at  timestamptz NOT NULL,
  landing_path      text        NOT NULL,
  exit_path         text,
  referrer_host     text,
  referrer_url      text,
  channel           text        NOT NULL DEFAULT 'direct'
                    CHECK (channel IN ('direct', 'search', 'social', 'referral', 'email', 'paid')),
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_term          text,
  utm_content       text,
  device_type       text        NOT NULL DEFAULT 'desktop'
                    CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser           text,
  browser_version   text,
  os                text,
  os_version        text,
  screen_width      integer,
  screen_height     integer,
  viewport_width    integer,
  pixel_ratio       real,
  language          text,
  timezone          text,
  country           text,
  page_views        integer     NOT NULL DEFAULT 0,
  events_count      integer     NOT NULL DEFAULT 0,
  active_ms         integer     NOT NULL DEFAULT 0
);
CREATE INDEX sessions_started_idx  ON sessions (started_at);
CREATE INDEX sessions_visitor_idx  ON sessions (visitor_id);
CREATE INDEX sessions_channel_idx  ON sessions (channel, started_at);
CREATE INDEX sessions_campaign_idx ON sessions (utm_campaign, started_at) WHERE utm_campaign IS NOT NULL;

CREATE TABLE page_views (
  id              bigserial   PRIMARY KEY,
  session_id      uuid        NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  visitor_id      uuid        NOT NULL,
  path            text        NOT NULL,
  title           text,
  occurred_at     timestamptz NOT NULL,
  duration_ms     integer,
  max_scroll_pct  smallint
);
CREATE INDEX page_views_time_idx    ON page_views (occurred_at);
CREATE INDEX page_views_path_idx    ON page_views (path, occurred_at);
CREATE INDEX page_views_session_idx ON page_views (session_id, occurred_at);

CREATE TABLE events (
  id           bigserial   PRIMARY KEY,
  session_id   uuid        NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
  visitor_id   uuid        NOT NULL,
  name         text        NOT NULL,
  path         text,
  props        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  occurred_at  timestamptz NOT NULL
);
CREATE INDEX events_name_time_idx ON events (name, occurred_at);
CREATE INDEX events_session_idx   ON events (session_id, occurred_at);

-- ---------------------------------------------------------------------------------------------
-- Leads: enquiries from prospective customers / design partners
-- ---------------------------------------------------------------------------------------------

CREATE TABLE contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref           text        NOT NULL UNIQUE,
  name          text        NOT NULL,
  email         text        NOT NULL,
  phone         text,
  organisation  text,
  job_title     text,
  topic         text        NOT NULL,
  segment       text,                 -- which customer segment they belong to (from the site's pitch)
  chip          text,                 -- digital | analog | both
  volume        text,                 -- expected annual volume band
  message       text        NOT NULL,
  status        text        NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  notes         text        NOT NULL DEFAULT '',
  consent_at    timestamptz NOT NULL DEFAULT now(),
  visitor_id    uuid,
  session_id    uuid REFERENCES sessions (id) ON DELETE SET NULL,
  channel       text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer_host text,
  landing_path  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contacts_created_idx ON contacts (created_at DESC);
CREATE INDEX contacts_status_idx  ON contacts (status, created_at DESC);
CREATE INDEX contacts_email_idx   ON contacts (email);

-- ---------------------------------------------------------------------------------------------
-- Recruiting: job applications (resumes live in the database so one backup covers everything)
-- ---------------------------------------------------------------------------------------------

CREATE TABLE applications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref           text        NOT NULL UNIQUE,
  job_slug      text        NOT NULL,
  job_title     text        NOT NULL,
  track         text,
  name          text        NOT NULL,
  email         text        NOT NULL,
  phone         text        NOT NULL,
  organisation  text,
  profile_url   text,
  note          text,
  status        text        NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  notes         text        NOT NULL DEFAULT '',
  consent_at    timestamptz NOT NULL DEFAULT now(),
  visitor_id    uuid,
  session_id    uuid REFERENCES sessions (id) ON DELETE SET NULL,
  channel       text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer_host text,
  landing_path  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX applications_created_idx ON applications (created_at DESC);
CREATE INDEX applications_job_idx     ON applications (job_slug, status, created_at DESC);

CREATE TABLE application_files (
  application_id  uuid PRIMARY KEY REFERENCES applications (id) ON DELETE CASCADE,
  filename        text    NOT NULL,
  mime_type       text    NOT NULL,
  size_bytes      integer NOT NULL,
  sha256          text    NOT NULL,
  content         bytea   NOT NULL
);

-- ---------------------------------------------------------------------------------------------
-- Early-access list
-- ---------------------------------------------------------------------------------------------

CREATE TABLE subscribers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text        NOT NULL UNIQUE,   -- always stored lower-case
  source           text,
  status           text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  visitor_id       uuid,
  channel          text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at  timestamptz
);
CREATE INDEX subscribers_created_idx ON subscribers (created_at DESC);

-- ---------------------------------------------------------------------------------------------
-- Milestones shown on the public roadmap (status is edited from the admin console)
-- ---------------------------------------------------------------------------------------------

CREATE TABLE milestones (
  id           text PRIMARY KEY,
  track        text    NOT NULL CHECK (track IN ('company', 'digital', 'analog')),
  kind         text    NOT NULL DEFAULT 'milestone' CHECK (kind IN ('milestone', 'gate')),
  title        text    NOT NULL,
  detail       text    NOT NULL DEFAULT '',
  target_date  date    NOT NULL,
  status       text    NOT NULL DEFAULT 'upcoming'
               CHECK (status IN ('completed', 'in_progress', 'upcoming', 'delayed')),
  completed_on date,
  sort_order   integer NOT NULL DEFAULT 0,
  edited       boolean NOT NULL DEFAULT false,   -- true once changed from the admin console; re-seeding then leaves the row alone
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX milestones_track_idx ON milestones (track, target_date);

-- ---------------------------------------------------------------------------------------------
-- Admin console access
-- ---------------------------------------------------------------------------------------------

CREATE TABLE admin_users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text        NOT NULL UNIQUE,
  name            text,
  password_hash   text        NOT NULL,
  failed_logins   integer     NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_login_at   timestamptz
);

CREATE TABLE admin_sessions (
  token_hash  text        PRIMARY KEY,           -- sha-256 of the cookie value; the raw token is never stored
  admin_id    uuid        NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  user_agent  text
);
CREATE INDEX admin_sessions_expiry_idx ON admin_sessions (expires_at);

CREATE TABLE audit_log (
  id          bigserial   PRIMARY KEY,
  admin_id    uuid        REFERENCES admin_users (id) ON DELETE SET NULL,
  action      text        NOT NULL,
  entity      text,
  entity_id   text,
  detail      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_time_idx ON audit_log (occurred_at DESC);
