const db = require('../config/database');

const getProfile = async (req, res, next) => {
  try {
    const result = db.query(
      `SELECT id,email,first_name,last_name,phone,role,is_active,is_verified,created_at,updated_at FROM users WHERE id=?`,
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    db.query(
      `UPDATE users SET first_name=?, last_name=?, phone=?, updated_at=datetime('now') WHERE id=?`,
      [firstName, lastName, phone, req.user.userId]
    );
    const result = db.query(
      `SELECT id,email,first_name,last_name,phone,role,is_active,is_verified,updated_at FROM users WHERE id=?`,
      [req.user.userId]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';

    const total = db.query(
      `SELECT COUNT(*) as count FROM users WHERE (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?) AND deleted_at IS NULL`,
      [search, search, search]
    ).rows[0].count;

    const users = db.query(
      `SELECT id,email,first_name,last_name,phone,role,is_active,is_verified,created_at
       FROM users WHERE (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?) AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [search, search, search, limit, offset]
    ).rows;

    res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const result = db.query(
      `SELECT u.id,u.email,u.first_name,u.last_name,u.phone,u.role,u.is_active,u.is_verified,u.created_at,
              w.balance,w.currency
       FROM users u LEFT JOIN wallets w ON w.user_id=u.id WHERE u.id=?`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = db.query(`SELECT id,is_active FROM users WHERE id=?`, [req.params.id]).rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    db.query(`UPDATE users SET is_active=?, updated_at=datetime('now') WHERE id=?`, [user.is_active ? 0 : 1, req.params.id]);
    const updated = db.query(`SELECT id,email,is_active FROM users WHERE id=?`, [req.params.id]).rows[0];
    res.json({ success: true, user: updated });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getAllUsers, getUserById, toggleUserStatus };
