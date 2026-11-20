-- A demo is a request, not a calendar booking: the customer says which day and time of day suits them, and the team
-- arranges the call by e-mail. Drops the slot, Meet-link and calendar-event columns of 002.
ALTER TABLE demos
  ADD COLUMN IF NOT EXISTS preferred_date date,
  ADD COLUMN IF NOT EXISTS preferred_time text CHECK (preferred_time IN ('morning', 'afternoon', 'evening'));

-- Keep the day anyone had already picked (India date).
UPDATE demos SET preferred_date = (slot_start AT TIME ZONE 'Asia/Kolkata')::date WHERE preferred_date IS NULL;

DROP INDEX IF EXISTS demos_slot_unique;
DROP INDEX IF EXISTS demos_slot_idx;

ALTER TABLE demos
  DROP COLUMN IF EXISTS slot_start,
  DROP COLUMN IF EXISTS slot_end,
  DROP COLUMN IF EXISTS visitor_timezone,
  DROP COLUMN IF EXISTS meet_link,
  DROP COLUMN IF EXISTS calendar_event_id;
