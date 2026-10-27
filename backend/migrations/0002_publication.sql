-- Existing content remains draft until approved for publication.
ALTER TABLE posts ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE teachers ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE achievements ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE school_life ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE contact_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'new'
  CHECK (status IN ('new', 'in_progress', 'resolved'));
ALTER TABLE contact_messages ADD COLUMN consent_at TEXT;
CREATE INDEX idx_posts_public_date ON posts (status, date DESC, slug);
CREATE INDEX idx_teachers_public_name ON teachers (status, name, slug);
CREATE INDEX idx_achievements_public_date ON achievements (status, achievement_date DESC, id);
CREATE INDEX idx_school_life_public ON school_life (status, id);
CREATE INDEX idx_contact_status ON contact_messages (status, created_at);
