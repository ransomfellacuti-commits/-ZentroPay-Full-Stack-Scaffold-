const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'zentropay.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema (existing tables unchanged)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    is_active INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    account_number TEXT UNIQUE,
    transaction_pin TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
    balance REAL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    description TEXT,
    payment_method TEXT DEFAULT 'card',
    transaction_reference TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS interbank_transfers (
    id TEXT PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id),
    sender_id TEXT NOT NULL REFERENCES users(id),
    sender_account_number TEXT,
    recipient_name TEXT NOT NULL,
    recipient_account TEXT NOT NULL,
    country TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    status TEXT DEFAULT 'completed',
    idempotency_key TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id),
    interbank_transfer_id TEXT REFERENCES interbank_transfers(id),
    receipt_data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_account_number ON users(account_number);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
  CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
  CREATE INDEX IF NOT EXISTS idx_interbank_sender ON interbank_transfers(sender_id);
  CREATE INDEX IF NOT EXISTS idx_interbank_idempotency ON interbank_transfers(idempotency_key);
  CREATE INDEX IF NOT EXISTS idx_receipts_transaction ON receipts(transaction_id);
  CREATE INDEX IF NOT EXISTS idx_receipts_transfer ON receipts(interbank_transfer_id);
  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
`);

// Add new columns to existing users table if they don't exist (migration)
try {
  db.exec(`ALTER TABLE users ADD COLUMN account_number TEXT UNIQUE`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE users ADD COLUMN transaction_pin TEXT`);
} catch (e) { /* column already exists */ }

// Add details/user_agent columns to audit_logs if missing
try {
  db.exec(`ALTER TABLE audit_logs ADD COLUMN details TEXT`);
} catch (e) { /* already exists */ }
try {
  db.exec(`ALTER TABLE audit_logs ADD COLUMN user_agent TEXT`);
} catch (e) { /* already exists */ }

// Helper: run a query and return result
const query = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return { rows: stmt.all(...params) };
    } else {
      const info = stmt.run(...params);
      return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
    }
  } catch (err) {
    console.error('DB Error:', err.message, sql);
    throw err;
  }
};

// Transaction helper
const transaction = (fn) => {
  const txn = db.transaction(fn);
  return txn;
};

module.exports = { query, transaction, db };
