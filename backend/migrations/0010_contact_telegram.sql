-- Preserve historical contacts; new submissions require a phone and Telegram username.
ALTER TABLE contact_messages ADD COLUMN telegram_username TEXT;
ALTER TABLE contact_messages ADD COLUMN email TEXT;

CREATE TABLE telegram_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL UNIQUE REFERENCES contact_messages(id) ON DELETE CASCADE,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT,
  delivery_part INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);
CREATE INDEX idx_telegram_outbox_pending ON telegram_outbox(sent_at, next_attempt_at, id);

-- A trigger makes saving the contact and enqueueing its notification atomic.
-- Historical contacts are available in the bot menu but are not mass-notified.
CREATE TRIGGER enqueue_contact_telegram AFTER INSERT ON contact_messages BEGIN
  INSERT INTO telegram_outbox (contact_id) VALUES (NEW.id);
END;

CREATE TABLE telegram_state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
