const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'zentropay-dev-secret-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const register = async ({ email, password, firstName, lastName, phone }) => {
  const existing = db.query('SELECT id FROM users WHERE email=?', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered'); err.status = 409; throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  db.query(
    `INSERT INTO users (id,email,password_hash,first_name,last_name,phone,role,is_active,is_verified)
     VALUES (?,?,?,?,?,?,'user',1,0)`,
    [userId, email, passwordHash, firstName, lastName, phone || null]
  );
  // Create wallet
  db.query(
    `INSERT OR IGNORE INTO wallets (id,user_id,balance,currency) VALUES (?,?,0.00,'USD')`,
    [uuidv4(), userId]
  );
  const user = db.query('SELECT id,email,first_name,last_name,role,created_at FROM users WHERE id=?', [userId]).rows[0];
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { user, token };
};

const login = async ({ email, password }) => {
  const result = db.query(
    `SELECT id,email,password_hash,first_name,last_name,role,is_active FROM users WHERE email=?`,
    [email]
  );
  if (result.rows.length === 0) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }
  const user = result.rows[0];
  if (!user.is_active) {
    const err = new Error('Account disabled'); err.status = 403; throw err;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
};

module.exports = { register, login };
