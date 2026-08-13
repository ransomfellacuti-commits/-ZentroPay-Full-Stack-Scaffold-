/**
 * authService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Handles ZentroPay-internal registration and login.
 * Issues ES256 JWTs signed with the ZentroPay internal private key.
 *
 * Token payload (mirrors Supabase shape for forward-compatibility):
 *   userId, email, role, iat, exp
 */

'use strict';

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db      = require('../config/database');
const {
  INTERNAL_PRIVATE_PEM,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
} = require('../config/jwtKeys');

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Generate a unique 10-digit numeric account number.
 * First digit is 1-9 (no leading zero). Retries up to 10 times.
 */
function generateAccountNumber() {
  const MAX_RETRIES = 10;
  for (let i = 0; i < MAX_RETRIES; i++) {
    const first = Math.floor(Math.random() * 9) + 1;
    const rest  = Math.floor(Math.random() * 1_000_000_000)
                    .toString().padStart(9, '0');
    const acct  = `${first}${rest}`;
    const exists = db.query('SELECT id FROM users WHERE account_number = ?', [acct]);
    if (!exists.rows.length) return acct;
  }
  throw new Error('Failed to generate unique account number');
}

/**
 * Sign a ZentroPay ES256 JWT.
 * kid header = 'zentropay-internal' so the middleware can route it correctly.
 */
function signToken(payload) {
  return jwt.sign(payload, INTERNAL_PRIVATE_PEM, {
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRES_IN,
    keyid:     'zentropay-internal',
  });
}

/* ── register ─────────────────────────────────────────────────────────────── */

const register = async ({ email, password, firstName, lastName, phone }) => {
  const safeEmail = String(email    || '').trim().toLowerCase();
  const safeFirst = String(firstName || '').trim().slice(0, 100);
  const safeLast  = String(lastName  || '').trim().slice(0, 100);
  const safePhone = phone ? String(phone).trim().slice(0, 30) : null;

  if (!safeEmail || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const existing = db.query('SELECT id FROM users WHERE email = ?', [safeEmail]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash  = await bcrypt.hash(password, 10);
  const userId        = uuidv4();
  const accountNumber = generateAccountNumber();

  db.query(
    `INSERT INTO users
       (id, email, password_hash, first_name, last_name, phone, role, is_active, is_verified, account_number)
     VALUES (?, ?, ?, ?, ?, ?, 'user', 1, 0, ?)`,
    [userId, safeEmail, passwordHash, safeFirst, safeLast, safePhone, accountNumber]
  );

  // Create wallet for the new user
  db.query(
    `INSERT OR IGNORE INTO wallets (id, user_id, balance, currency) VALUES (?, ?, 0.00, 'USD')`,
    [uuidv4(), userId]
  );

  const user = db.query(
    `SELECT id, email, first_name, last_name, role, account_number, created_at
     FROM users WHERE id = ?`,
    [userId]
  ).rows[0];

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user, token };
};

/* ── login ────────────────────────────────────────────────────────────────── */

const login = async ({ email, password }) => {
  const safeEmail = String(email || '').trim().toLowerCase();

  const result = db.query(
    `SELECT id, email, password_hash, first_name, last_name, role, is_active, account_number
     FROM users WHERE email = ?`,
    [safeEmail]
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    const err = new Error('Account disabled');
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
};

module.exports = { register, login, generateAccountNumber };
