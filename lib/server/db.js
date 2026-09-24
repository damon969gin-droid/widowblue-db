// lib/server/db.js
// Versione per Cloudflare D1 (SQLite gestito)
// Tutte le funzioni sono async e ricevono il binding D1 (env.DB)

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_group INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS steps_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  day TEXT NOT NULL,
  steps INTEGER NOT NULL,
  wblu_awarded REAL NOT NULL,
  UNIQUE(user_id, day)
);
`;

export const SEED_CONTACTS = [
  ["giulia", "Giulia Bianchi", 0],
  ["marco", "Marco - Sviluppo", 0],
  ["nodo-milano", "Nodo Milano Centro", 1],
  ["team", "Widow Blue Team", 1],
];

// Inizializza lo schema e i seed (da chiamare una volta, es. all'avvio del worker)
export async function initDb(db) {
  if (!db) {
    throw new Error("D1 binding non disponibile. Assicurati di aver configurato il binding DB nel worker.");
  }

  // Crea tabelle con statement separati
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    totp_secret TEXT,
    totp_enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_group INTEGER NOT NULL DEFAULT 0
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS steps_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    day TEXT NOT NULL,
    steps INTEGER NOT NULL,
    wblu_awarded REAL NOT NULL,
    UNIQUE(user_id, day)
  )`);

  // Seed contatti
  const insert = db.prepare(
    "INSERT OR IGNORE INTO contacts (id, name, is_group) VALUES (?, ?, ?)"
  );

  const batch = SEED_CONTACTS.map(([id, name, isGroup]) =>
    insert.bind(id, name, isGroup)
  );

  if (batch.length > 0) {
    await db.batch(batch);
  }
}

// Utenti

export async function createUser(db, { email, phone, password_hash, totp_secret = null }) {
  const stmt = db.prepare(
    `INSERT INTO users (email, phone, password_hash, totp_secret)
     VALUES (?, ?, ?, ?)`
  ).bind(email, phone, password_hash, totp_secret);

  await stmt.run();
  // Per ottenere l'ID appena inserito:
  const row = await db.prepare("SELECT last_insert_rowid() AS id").first();
  return { id: row.id, email, phone, totp_secret };
}

export async function getUserByEmail(db, email) {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?").bind(email);
  return await stmt.first();
}

export async function getUserById(db, id) {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?").bind(id);
  return await stmt.first();
}

export async function updateUserTotp(db, userId, totp_secret, totp_enabled) {
  const stmt = db.prepare(
    `UPDATE users
     SET totp_secret = ?, totp_enabled = ?
     WHERE id = ?`
  ).bind(totp_secret, totp_enabled ? 1 : 0, userId);

  await stmt.run();
}

// Contatti

export async function getContacts(db) {
  const stmt = db.prepare("SELECT * FROM contacts ORDER BY name");
  const { results } = await stmt.all();
  return results || [];
}

export async function getContactById(db, id) {
  const stmt = db.prepare("SELECT * FROM contacts WHERE id = ?").bind(id);
  return await stmt.first();
}

// Messaggi

export async function saveMessage(db, { contact_id, user_id, sender, text }) {
  const stmt = db.prepare(
    `INSERT INTO messages (contact_id, user_id, sender, text)
     VALUES (?, ?, ?, ?)`
  ).bind(contact_id, user_id, sender, text);

  await stmt.run();
}

export async function getMessagesForContact(db, contactId, limit = 50, offset = 0) {
  const stmt = db.prepare(
    `SELECT * FROM messages
     WHERE contact_id = ?
     ORDER BY created_at ASC
     LIMIT ? OFFSET ?`
  ).bind(contactId, limit, offset);

  const { results } = await stmt.all();
  return results || [];
}

export async function getMessagesForUser(db, userId, limit = 50, offset = 0) {
  const stmt = db.prepare(
    `SELECT * FROM messages
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(userId, limit, offset);

  const { results } = await stmt.all();
  return results || [];
}

// Steps log (rewards)

export async function getStepLog(db, userId, day) {
  const stmt = db.prepare(
    `SELECT * FROM steps_log WHERE user_id = ? AND day = ?`
  ).bind(userId, day);

  return await stmt.first();
}

export async function upsertStepLog(db, { user_id, day, steps, wblu_awarded }) {
  const stmt = db.prepare(
    `INSERT INTO steps_log (user_id, day, steps, wblu_awarded)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, day) DO UPDATE SET
       steps = excluded.steps,
       wblu_awarded = excluded.wblu_awarded`
  ).bind(user_id, day, steps, wblu_awarded);

  await stmt.run();
}

