-- Customisation requests arrive through the same table as questions: `topic` tells them apart, and the
-- ZT-AFE1 delivery format (soft / hard IP) is kept for requests about the analog chip.
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS topic         text NOT NULL DEFAULT 'question' CHECK (topic IN ('question', 'customisation')),
  ADD COLUMN IF NOT EXISTS analog_format text CHECK (analog_format IN ('soft', 'hard', 'both'));

CREATE INDEX IF NOT EXISTS contacts_topic_idx ON contacts (topic, created_at DESC);
