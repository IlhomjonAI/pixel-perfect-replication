ALTER TABLE school_life ADD COLUMN category TEXT NOT NULL DEFAULT 'Faoliyat';
ALTER TABLE school_life ADD COLUMN event_date TEXT;
ALTER TABLE school_life ADD COLUMN gallery TEXT NOT NULL DEFAULT '[]';
ALTER TABLE school_life ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE school_life ADD COLUMN updated_at TEXT;
CREATE INDEX idx_school_life_date ON school_life (status, event_date DESC, id);
