-- Content + auth schema for the Turso (libSQL) database.
-- Re-runnable: every statement is IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

-- One row per chromogramme set. JSON columns hold the exact shapes the app
-- already consumes (`puzzles`: array of puzzle ids, `pieces`: array of the 7
-- artwork objects), so read code maps 1:1 to the old content/*.json files.
CREATE TABLE IF NOT EXISTS chromograms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  puzzles_json TEXT NOT NULL DEFAULT '[]',
  pieces_json TEXT NOT NULL DEFAULT '[]',
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Global puzzles (shared across sets). `container_json` + `pieces_json` hold
-- the layout exported by /editor ({ container: {width,height}, pieces: [...] }).
CREATE TABLE IF NOT EXISTS puzzles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  scale REAL,
  container_json TEXT NOT NULL DEFAULT '{"width":400,"height":600}',
  pieces_json TEXT NOT NULL DEFAULT '[]',
  completed INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
