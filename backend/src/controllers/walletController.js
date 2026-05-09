const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getBalance = async (req, res, next) => {
  try {
    const result = db.query(
      `SELECT w.*, u.email, u.first_name, u.last_name
       FROM wallets w JOIN users u ON u.id=w.user_id WHERE w.user_id=?`,
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Wallet not found' });
    res.json({ success: true, wallet: result.rows[0] });
  } catch (err) { next(err); }
};

const transfer = async (req, res, next) => {
  try {
    const { recipientId, amount, currency = 'USD', description } = req.body;
    if (!recipientId || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'recipientId and valid amount required' });
    }
    if (recipientId === req.user.userId) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
    }

    const doTransfer = db.transaction(() => {
      const senderWallet = db.query(`SELECT * FROM wallets WHERE user_id=?`, [req.user.userId]).rows[0];
      if (!senderWallet || senderWallet.balance < parseFloat(amount)) {
        const err = new Error('Insufficient balance'); err.status = 400; throw err;
      }
      const recipientWallet = db.query(`SELECT * FROM wallets WHERE user_id=?`, [recipientId]).rows[0];
      if (!recipientWallet) {
        const err = new Error('Recipient wallet not found'); err.status = 404; throw err;
      }

      db.query(`UPDATE wallets SET balance=balance-?, updated_at=datetime('now') WHERE user_id=?`, [amount, req.user.userId]);
      db.query(`UPDATE wallets SET balance=balance+?, updated_at=datetime('now') WHERE user_id=?`, [amount, recipientId]);

      const ref = `ZTP-TRF-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
      const txId = uuidv4();
      db.query(
        `INSERT INTO transactions (id,user_id,amount,currency,status,description,payment_method,transaction_reference,completed_at)
         VALUES (?,?,?,?,'completed',?,'wallet',?,datetime('now'))`,
        [txId, req.user.userId, -Math.abs(amount), currency, description || `Transfer to ${recipientId}`, ref + '-DEBIT']
      );
      db.query(
        `INSERT INTO transactions (id,user_id,amount,currency,status,description,payment_method,transaction_reference,completed_at)
         VALUES (?,?,?,?,'completed',?,'wallet',?,datetime('now'))`,
        [uuidv4(), recipientId, Math.abs(amount), currency, description || `Transfer received`, ref + '-CREDIT']
      );
      return db.query('SELECT * FROM transactions WHERE id=?', [txId]).rows[0];
    });

    const tx = doTransfer();
    res.json({ success: true, message: 'Transfer successful', transaction: tx });
  } catch (err) { next(err); }
};

const getAllWallets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const total = db.query(`SELECT COUNT(*) as count FROM wallets`).rows[0].count;
    const wallets = db.query(
      `SELECT w.*, u.email, u.first_name, u.last_name
       FROM wallets w JOIN users u ON u.id=w.user_id ORDER BY w.balance DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    ).rows;
    res.json({ success: true, wallets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

module.exports = { getBalance, transfer, getAllWallets };
