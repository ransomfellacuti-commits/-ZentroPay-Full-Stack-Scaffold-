const authService = require('../services/authService');
const db = require('../config/database');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'email, password, firstName, lastName are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const data = await authService.register({ email, password, firstName, lastName, phone });
    res.status(201).json({ success: true, message: 'Registration successful', ...data });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }
    const data = await authService.login({ email, password });
    res.json({ success: true, message: 'Login successful', ...data });
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    const result = db.query(
      `SELECT id,email,first_name,last_name,phone,role,is_active,is_verified,created_at FROM users WHERE id=?`,
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { register, login, me };
