import { createClient, type Client } from '@libsql/client';
import path from 'path';

let _db: Client | null = null;

function getDb(): Client {
  if (_db) return _db;
  const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '../../poker.db')}`;
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  console.log('[db] init, url scheme:', url.split('://')[0]);
  _db = createClient(authToken ? { url, authToken } : { url });
  return _db;
}

export async function initDb() {
  await getDb().executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_color TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      small_blind REAL DEFAULT 0.25,
      big_blind REAL DEFAULT 0.5,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS session_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      buy_in REAL NOT NULL DEFAULT 0,
      cash_out REAL NOT NULL DEFAULT 0,
      UNIQUE(session_id, user_id)
    );
  `);
}

const db = new Proxy({} as Client, {
  get(_target, prop) {
    return (getDb() as any)[prop as string];
  },
});

export default db;
