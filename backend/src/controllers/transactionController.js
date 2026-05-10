const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const isAdmin = req.user.role === 'admin';

    let where = isAdmin ? 'WHERE 1=1' : `WHERE t.user_id='${req.user.userId}'`;
    const params = [];
    if (status) { where += ` AND t.status=?`; params.push(status); }

    const total = db.query(`SELECT COUNT(*) as count FROM transactions t ${where}`, params).rows[0].count;
    const transactions = db.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t LEFT JOIN users u ON u.id=t.user_id
       ${where} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ).rows;

    res.json({ success: true, transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

const getTransactionById = async (req, res, next) => {
  try {
    const result = db.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t LEFT JOIN users u ON u.id=t.user_id WHERE t.id=?`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Transaction not found' });
    const tx = result.rows[0];
    if (req.user.role !== 'admin' && tx.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, transaction: tx });
  } catch (err) { next(err); }
};

const createTransaction = async (req, res, next) => {
  try {
    const { amount, currency = 'USD', description, paymentMethod = 'card' } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }
    const ref = `ZTP-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
    const id = uuidv4();
    db.query(
      `INSERT INTO transactions (id,user_id,amount,currency,status,description,payment_method,transaction_reference,completed_at)
       VALUES (?,?,?,?,'completed',?,?,?,datetime('now'))`,
      [id, req.user.userId, amount, currency, description || null, paymentMethod, ref]
    );
    db.query(`UPDATE wallets SET balance=balance+?, updated_at=datetime('now') WHERE user_id=?`, [amount, req.user.userId]);
    const tx = db.query('SELECT * FROM transactions WHERE id=?', [id]).rows[0];
    res.status(201).json({ success: true, transaction: tx });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const totalTx    = db.query(`SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as volume FROM transactions WHERE status='completed'`).rows[0];
    const todayTx    = db.query(`SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as volume FROM transactions WHERE status='completed' AND date(created_at)=date('now')`).rows[0];
    const pendingTx  = db.query(`SELECT COUNT(*) as count FROM transactions WHERE status='pending'`).rows[0];
    const totalUsers = db.query(`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`).rows[0];
    const activeUsers= db.query(`SELECT COUNT(*) as count FROM users WHERE is_active=1 AND deleted_at IS NULL`).rows[0];
    const totalWallet= db.query(`SELECT COALESCE(SUM(balance),0) as total FROM wallets`).rows[0];
    const recentTx   = db.query(
      `SELECT t.id,t.amount,t.currency,t.status,t.created_at,u.email,u.first_name,u.last_name
       FROM transactions t LEFT JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT 5`
    ).rows;

    // Monthly volume (last 6 months)
    const monthlyVolume = db.query(`
      SELECT strftime('%Y-%m', created_at) as month, COALESCE(SUM(amount),0) as volume, COUNT(*) as count
      FROM transactions WHERE status='completed' AND created_at >= date('now','-6 months')
      GROUP BY strftime('%Y-%m', created_at) ORDER BY month ASC
    `).rows;

    res.json({
      success: true,
      stats: {
        transactions: {
          total: totalTx.count, volume: totalTx.volume,
          today: todayTx.count, todayVolume: todayTx.volume,
          pending: pendingTx.count
        },
        users: { total: totalUsers.count, active: activeUsers.count },
        wallet: { totalBalance: totalWallet.total },
        recentTransactions: recentTx,
        monthlyVolume
      }
    });
  } catch (err) { next(err); }
};

module.exports = { getTransactions, getTransactionById, createTransaction, getStats };
