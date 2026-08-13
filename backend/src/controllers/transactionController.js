const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/* ── GET /api/transactions ─────────────────────────────────────────────── */
const getTransactions = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const isAdmin = req.user.role === 'admin';

    // Use parameterised WHERE — no string interpolation
    const conditions = [];
    const params     = [];
    if (!isAdmin) { conditions.push('t.user_id = ?'); params.push(req.user.userId); }
    if (status)   { conditions.push('t.status = ?'); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = db.query(
      `SELECT COUNT(*) as count FROM transactions t ${where}`,
      params
    ).rows[0].count;

    const transactions = db.query(
      `SELECT t.id, t.amount, t.currency, t.status, t.description,
              t.payment_method, t.transaction_reference,
              t.created_at, t.completed_at,
              u.email, u.first_name, u.last_name
       FROM transactions t
       LEFT JOIN users u ON u.id = t.user_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ).rows;

    // ETag for caching
    const etag = `"txlist-${req.user.userId}-${page}-${status || 'all'}-${total}"`
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    res.set('ETag', etag);
    res.set('Cache-Control', 'private, max-age=10');

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
};

/* ── GET /api/transactions/:id ─────────────────────────────────────────── */
const getTransactionById = async (req, res, next) => {
  try {
    const result = db.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t LEFT JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    const tx = result.rows[0];
    if (req.user.role !== 'admin' && tx.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, transaction: tx });
  } catch (err) { next(err); }
};

/* ── POST /api/transactions ────────────────────────────────────────────── */
const createTransaction = async (req, res, next) => {
  try {
    const { amount, currency = 'USD', description, paymentMethod = 'card' } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }
    const safeAmount = parseFloat(parseFloat(amount).toFixed(2));
    const ref  = `ZTP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const id   = uuidv4();
    db.query(
      `INSERT INTO transactions
         (id, user_id, amount, currency, status, description, payment_method, transaction_reference, completed_at)
       VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, datetime('now'))`,
      [id, req.user.userId, safeAmount, currency, description || null, paymentMethod, ref]
    );
    db.query(
      `UPDATE wallets SET balance = balance + ?, updated_at = datetime('now') WHERE user_id = ?`,
      [safeAmount, req.user.userId]
    );
    const tx = db.query('SELECT * FROM transactions WHERE id = ?', [id]).rows[0];
    res.status(201).json({ success: true, transaction: tx });
  } catch (err) { next(err); }
};

/* ── GET /api/transactions/stats ───────────────────────────────────────── */
const getStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const uid     = req.user.userId;

    // Scoped WHERE clause for non-admin users
    const txWhere  = isAdmin ? `WHERE status='completed'` : `WHERE status='completed' AND user_id=?`;
    const txParams = isAdmin ? [] : [uid];
    const allWhere = isAdmin ? '' : `WHERE user_id=?`;

    const totalTx   = db.query(`SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as volume FROM transactions ${txWhere}`, txParams).rows[0];
    const todayTx   = db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as volume FROM transactions ${txWhere} AND date(created_at)=date('now')`,
      txParams
    ).rows[0];
    const pendingTx = db.query(
      `SELECT COUNT(*) as count FROM transactions WHERE status='pending'${isAdmin ? '' : ' AND user_id=?'}`,
      isAdmin ? [] : [uid]
    ).rows[0];

    const totalUsers  = db.query(`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`).rows[0];
    const activeUsers = db.query(`SELECT COUNT(*) as count FROM users WHERE is_active=1 AND deleted_at IS NULL`).rows[0];
    const totalWallet = db.query(`SELECT COALESCE(SUM(balance),0) as total FROM wallets${isAdmin ? '' : ' WHERE user_id=?'}`, isAdmin ? [] : [uid]).rows[0];

    const recentTx = db.query(
      `SELECT t.id, t.amount, t.currency, t.status, t.created_at,
              u.email, u.first_name, u.last_name
       FROM transactions t LEFT JOIN users u ON u.id=t.user_id
       ${allWhere} ORDER BY t.created_at DESC LIMIT 5`,
      isAdmin ? [] : [uid]
    ).rows;

    // Monthly volume (last 6 months) — scoped to user for non-admin
    const monthlyVolume = db.query(
      `SELECT strftime('%Y-%m', created_at) as month,
              COALESCE(SUM(amount),0) as volume,
              COUNT(*) as count
       FROM transactions
       WHERE status='completed' AND created_at >= date('now','-6 months')${isAdmin ? '' : ' AND user_id=?'}
       GROUP BY strftime('%Y-%m', created_at)
       ORDER BY month ASC`,
      isAdmin ? [] : [uid]
    ).rows;

    // ETag based on total + latest tx timestamp
    const latestTs = recentTx[0]?.created_at || '0';
    const etag = `"stats-${uid}-${totalTx.count}-${latestTs}"`;
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }
    res.set('ETag', etag);
    res.set('Cache-Control', 'private, max-age=10');

    res.json({
      success: true,
      stats: {
        transactions: {
          total:       totalTx.count,
          volume:      totalTx.volume,
          today:       todayTx.count,
          todayVolume: todayTx.volume,
          pending:     pendingTx.count,
        },
        users:  { total: totalUsers.count, active: activeUsers.count },
        wallet: { totalBalance: totalWallet.total },
        recentTransactions: recentTx,
        monthlyVolume,
      }
    });
  } catch (err) { next(err); }
};

module.exports = { getTransactions, getTransactionById, createTransaction, getStats };
