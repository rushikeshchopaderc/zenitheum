-- Simplify the data tier to what the business actually needs:
--   contacts · demos · orders · applications (resumes live in Google Drive) · subscribers · milestones
-- No visitor tracking, no admin accounts or audit trail in the database (the console signs in with environment credentials).

-- Resumes must never be silently destroyed: refuse to run while any are still stored in the database.
DO $$
BEGIN
  IF to_regclass('application_files') IS NOT NULL AND (SELECT count(*) FROM application_files) > 0 THEN
    RAISE EXCEPTION 'application_files still holds resumes: download them from the console, then empty the table and re-run';
  END IF;
END $$;

DROP TABLE IF EXISTS application_files, events, page_views, sessions, visitors, admin_sessions, audit_log, admin_users CASCADE;

-- ---------------------------------------------------------------------------------------------
-- contacts: "Ask a question"
-- ---------------------------------------------------------------------------------------------
ALTER TABLE contacts
  DROP COLUMN IF EXISTS topic,
  DROP COLUMN IF EXISTS volume,
  DROP COLUMN IF EXISTS visitor_id,
  DROP COLUMN IF EXISTS session_id,
  DROP COLUMN IF EXISTS channel,
  DROP COLUMN IF EXISTS utm_source,
  DROP COLUMN IF EXISTS utm_medium,
  DROP COLUMN IF EXISTS utm_campaign,
  DROP COLUMN IF EXISTS referrer_host,
  DROP COLUMN IF EXISTS landing_path;

-- ---------------------------------------------------------------------------------------------
-- applications: the resume is a document in Google Drive; only its name and link are kept here
-- ---------------------------------------------------------------------------------------------
ALTER TABLE applications
  DROP COLUMN IF EXISTS visitor_id,
  DROP COLUMN IF EXISTS session_id,
  DROP COLUMN IF EXISTS channel,
  DROP COLUMN IF EXISTS utm_source,
  DROP COLUMN IF EXISTS utm_medium,
  DROP COLUMN IF EXISTS utm_campaign,
  DROP COLUMN IF EXISTS referrer_host,
  DROP COLUMN IF EXISTS landing_path,
  ADD COLUMN IF NOT EXISTS resume_name    text,
  ADD COLUMN IF NOT EXISTS resume_url     text,
  ADD COLUMN IF NOT EXISTS resume_file_id text;

-- ---------------------------------------------------------------------------------------------
-- subscribers: chip release news, with the chip and delivery format the person cares about
-- ---------------------------------------------------------------------------------------------
ALTER TABLE subscribers
  DROP COLUMN IF EXISTS visitor_id,
  DROP COLUMN IF EXISTS channel,
  DROP COLUMN IF EXISTS utm_source,
  DROP COLUMN IF EXISTS utm_medium,
  DROP COLUMN IF EXISTS utm_campaign,
  ADD COLUMN IF NOT EXISTS name          text,
  ADD COLUMN IF NOT EXISTS chip          text CHECK (chip IN ('analog', 'digital', 'both')),
  ADD COLUMN IF NOT EXISTS analog_format text CHECK (analog_format IN ('soft', 'hard', 'both'));

-- ---------------------------------------------------------------------------------------------
-- demos: booked product demonstrations (a Google Meet link is created for each)
--   ZT-AFE1 is delivered as soft IP, hard IP or both; ZT-SEC1 is licensed as soft IP only.
-- ---------------------------------------------------------------------------------------------
CREATE TABLE demos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref               text        NOT NULL UNIQUE,
  name              text        NOT NULL,
  email             text        NOT NULL,
  phone             text        NOT NULL,
  organisation      text        NOT NULL,
  job_title         text,
  segment           text,
  chip              text        NOT NULL CHECK (chip IN ('analog', 'digital', 'both')),
  analog_format     text        CHECK (analog_format IN ('soft', 'hard', 'both')),
  message           text,
  slot_start        timestamptz NOT NULL,
  slot_end          timestamptz NOT NULL,
  visitor_timezone  text,
  meet_link         text,
  calendar_event_id text,
  status            text        NOT NULL DEFAULT 'requested'
                    CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled', 'no_show')),
  notes             text        NOT NULL DEFAULT '',
  consent_at        timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
-- One live booking per slot: a cancelled demo frees its slot.
CREATE UNIQUE INDEX demos_slot_unique ON demos (slot_start) WHERE status IN ('requested', 'scheduled');
CREATE INDEX demos_slot_idx    ON demos (slot_start);
CREATE INDEX demos_created_idx ON demos (created_at DESC);

-- ---------------------------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------------------------
CREATE TABLE orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref               text        NOT NULL UNIQUE,
  contact_name      text        NOT NULL,
  email             text        NOT NULL,
  phone             text        NOT NULL,
  organisation      text        NOT NULL,
  job_title         text,
  chip              text        NOT NULL CHECK (chip IN ('analog', 'digital')),
  analog_format     text        CHECK (analog_format IN ('soft', 'hard', 'both')),
  quantity          integer     NOT NULL CHECK (quantity > 0),
  delivery_date     date        NOT NULL,
  delivery_location text        NOT NULL,
  customisation     text,
  notes             text,
  status            text        NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'confirmed', 'in_progress', 'delivered', 'cancelled')),
  internal_notes    text        NOT NULL DEFAULT '',
  consent_at        timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_created_idx ON orders (created_at DESC);
CREATE INDEX orders_status_idx  ON orders (status, created_at DESC);
