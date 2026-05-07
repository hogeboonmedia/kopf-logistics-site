-- Migration 005: Allow 'chatbot' as a valid source for contact_submissions.
--
-- The chatbot widget lets visitors drop their contact info inside the chat
-- after a high-intent moment (asking about shipping, agent program, drivers).
-- Those leads route through the same /api/contact pipeline as the other
-- forms, but tagged source='chatbot' so an admin can see at a glance which
-- channel drove the lead.
--
-- Idempotent: drops + re-adds the constraint each run.

ALTER TABLE contact_submissions
  DROP CONSTRAINT IF EXISTS chk_source;
ALTER TABLE contact_submissions
  ADD CONSTRAINT chk_source CHECK (source IN ('contact','agent','shippers','drivers','chatbot'));
