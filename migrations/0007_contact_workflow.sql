ALTER TABLE contact_messages ADD COLUMN request_id TEXT;
ALTER TABLE contact_messages ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contact_messages ADD COLUMN updated_at TEXT;
CREATE UNIQUE INDEX idx_contact_request_id ON contact_messages(request_id);
CREATE TABLE contact_submission_limits (
  bucket TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
