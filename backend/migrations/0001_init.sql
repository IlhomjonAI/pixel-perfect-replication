-- Local/schema-only migration. Do not apply remotely until database_id is set.

CREATE TABLE IF NOT EXISTS posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image TEXT,
  gallery TEXT NOT NULL DEFAULT '[]',
  is_demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  class_at_achievement TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  stage TEXT NOT NULL,
  result TEXT NOT NULL,
  achievement_date TEXT NOT NULL,
  teacher_name TEXT,
  certificate_image TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS teachers (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo TEXT,
  subject TEXT NOT NULL,
  qualification TEXT NOT NULL,
  education TEXT NOT NULL,
  experience TEXT NOT NULL,
  biography TEXT NOT NULL,
  certificates TEXT NOT NULL DEFAULT '[]',
  is_demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS school_life (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_date ON posts (date DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_date ON achievements (achievement_date DESC);
