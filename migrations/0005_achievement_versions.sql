ALTER TABLE achievements ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE achievements ADD COLUMN updated_at TEXT;
CREATE INDEX idx_achievements_public_filters ON achievements (status,type,stage,achievement_date DESC);
