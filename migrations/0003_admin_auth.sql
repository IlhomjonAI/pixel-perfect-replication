CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  credential_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX idx_admin_sessions_expiry ON admin_sessions(expires_at);
CREATE TABLE admin_login_limits (
  bucket TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
