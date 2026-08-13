const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { GLOBAL_BANKS, FLAT_BANK_LIST } = require('../data/globalBanks');

// ── Audit helper ─────────────────────────────────────────────────────────────
function logAudit(userId, action, resourceType, resourceId, details, req) {
  try {
    db.query(
      `INSERT INTO audit_logs (id,user_id,action,resource_type,resource_id,details,ip_address,user_agent)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        uuidv4(), userId, action, resourceType, resourceId,
        typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
        req?.ip || null,
        req?.headers?.['user-agent'] || null,
      ]
    );
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
}

// ── GET /api/transfers/countries  (legacy — still works) ─────────────────────
const getCountries = (req, res) => {
  const list = GLOBAL_BANKS.map(({ code, name, flag, currency, banks }) => ({
    code, name, flag, currency,
    banks: banks.map(b => b.name),
  }));
  res.json({ success: true, countries: list });
};

// ── GET /api/transfers/banks  (new — flat searchable list) ───────────────────
const getBanks = (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  let results = FLAT_BANK_LIST;
  if (q) {
    results = FLAT_BANK_LIST.filter(b => b.searchKey.includes(q));
  }
  const banks = results.slice(0, limit);

  // ETag — banks list is static, cache aggressively
  const etag = `"banks-${q}-${limit}-${banks.length}"`;
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.set('ETag', etag);
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour — list never changes at runtime

  res.json({
    success: true,
    banks,
    total: results.length,
  });
};

// ── POST /api/transfers  ──────────────────────────────────────────────────────
const createInterbankTransfer = async (req, res, next) => {
  try {
    const {
      recipientName,
      recipientAccount,
      bankName,
      // country and currency are now optional (auto-resolved from bank)
      country: countryOverride,
      currency: currencyOverride,
      amount,
      description,
      transactionPin,
      idempotencyKey,
    } = req.body;

    // ── Input sanitization ─────────────────────────────────────────────────
    const safeRecipientName    = String(recipientName    || '').trim().slice(0, 200);
    const safeRecipientAccount = String(recipientAccount || '').trim().slice(0, 50);
    const safeBankName         = String(bankName         || '').trim().slice(0, 200);
    const safeDescription      = String(description      || '').trim().slice(0, 500);

    // ── Resolve bank info from global directory ────────────────────────────
    const bankInfo = FLAT_BANK_LIST.find(
      b => b.bankName.toLowerCase() === safeBankName.toLowerCase()
    );

    const safeCountry  = bankInfo?.countryCode || (countryOverride ? String(countryOverride).trim().toUpperCase() : 'XX');
    const safeCurrency = bankInfo?.currency    || (currencyOverride ? String(currencyOverride).trim().toUpperCase() : 'USD');
    const countryName  = bankInfo?.countryName || safeCountry;
    const bankFlag     = bankInfo?.flag        || '🏦';

    // ── Validation (no transfer limits) ────────────────────────────────────
    const errors = [];
    if (!safeRecipientName)                         errors.push('Recipient name is required');
    if (!safeRecipientAccount)                      errors.push('Recipient account number is required');
    if (!/^\d{6,30}$/.test(safeRecipientAccount))  errors.push('Account number must be 6–30 digits');
    if (!safeBankName)                              errors.push('Bank name is required');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) errors.push('Valid amount required');
    if (!transactionPin)                            errors.push('Transaction PIN is required');

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const transferAmount = parseFloat(parseFloat(amount).toFixed(2));

    // ── Sender info ────────────────────────────────────────────────────────
    const sender = db.query(
      `SELECT id,first_name,last_name,account_number,transaction_pin FROM users WHERE id=?`,
      [req.user.userId]
    ).rows[0];
    if (!sender) return res.status(404).json({ success: false, message: 'Sender not found' });

    // ── PIN verification ───────────────────────────────────────────────────
    if (!sender.transaction_pin) {
      return res.status(400).json({
        success: false,
        message: 'Transaction PIN not set. Go to More → Security to set your PIN.',
      });
    }
    const pinValid = await bcrypt.compare(String(transactionPin), sender.transaction_pin);
    if (!pinValid) {
      logAudit(req.user.userId, 'TRANSFER_PIN_FAIL', 'interbank_transfer', null,
        { bank: safeBankName, amount: transferAmount }, req);
      return res.status(401).json({ success: false, message: 'Incorrect transaction PIN' });
    }

    // ── Duplicate prevention ───────────────────────────────────────────────
    if (idempotencyKey) {
      const safeKey = String(idempotencyKey).trim().slice(0, 100);
      const existing = db.query(
        `SELECT id FROM interbank_transfers WHERE idempotency_key=?`, [safeKey]
      ).rows[0];
      if (existing) {
        const existingReceipt = db.query(
          `SELECT receipt_data FROM receipts WHERE interbank_transfer_id=?`, [existing.id]
        ).rows[0];
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: 'Transfer already processed',
          receipt: existingReceipt ? JSON.parse(existingReceipt.receipt_data) : null,
        });
      }
    }

    // ── Balance check ──────────────────────────────────────────────────────
    const wallet = db.query(
      `SELECT id,balance,currency FROM wallets WHERE user_id=?`, [req.user.userId]
    ).rows[0];
    if (!wallet) return res.status(400).json({ success: false, message: 'Wallet not found' });
    if (wallet.balance < transferAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ${wallet.balance.toFixed(2)} ${wallet.currency}`,
      });
    }

    // ── Atomic execute ─────────────────────────────────────────────────────
    const txId       = uuidv4();
    const transferId = uuidv4();
    const receiptId  = uuidv4();
    const now        = new Date().toISOString();
    const ref        = `ZTP-IB-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
    const safeIdemKey = idempotencyKey ? String(idempotencyKey).trim().slice(0, 100) : ref;

    const perform = db.transaction(() => {
      // 1. Debit wallet
      db.query(
        `UPDATE wallets SET balance=balance-?, updated_at=datetime('now') WHERE user_id=?`,
        [transferAmount, req.user.userId]
      );

      // 2. Transaction record
      db.query(
        `INSERT INTO transactions
           (id,user_id,amount,currency,status,description,payment_method,transaction_reference,completed_at)
         VALUES (?,?,?,?,'completed',?,?,'bank_transfer',datetime('now'))`,
        [txId, req.user.userId, -transferAmount, safeCurrency,
          `Interbank transfer to ${safeRecipientName} (${safeBankName})`, ref]
      );

      // 3. Interbank transfer record
      db.query(
        `INSERT INTO interbank_transfers
           (id,transaction_id,sender_id,sender_account_number,recipient_name,
            recipient_account,country,bank_name,amount,currency,description,
            status,idempotency_key,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,'completed',?,?)`,
        [transferId, txId, req.user.userId, sender.account_number || '',
          safeRecipientName, safeRecipientAccount, safeCountry, safeBankName,
          transferAmount, safeCurrency, safeDescription, safeIdemKey, now]
      );

      // 4. Receipt data
      const receiptData = {
        receiptId,
        transactionId: txId,
        transferId,
        status:    'Successful',
        reference: ref,
        dateTime:  now,
        sender: {
          name:          `${sender.first_name} ${sender.last_name}`.trim(),
          accountNumber: sender.account_number || 'N/A',
        },
        recipient: {
          name:          safeRecipientName,
          accountNumber: safeRecipientAccount,
          bank:          safeBankName,
          bankFlag,
          country:       countryName,
          countryCode:   safeCountry,
          currency:      safeCurrency,
          swift:         bankInfo?.swift || '',
        },
        amount:            transferAmount,
        currency:          safeCurrency,
        description:       safeDescription || 'Interbank Transfer',
        processingStatus:  'Cleared',
        authorizedBy:      'ZentroPay Banking System',
        generatedAt:       now,
      };

      // 5. Save receipt
      db.query(
        `INSERT INTO receipts (id,transaction_id,interbank_transfer_id,receipt_data,created_at)
         VALUES (?,?,?,?,?)`,
        [receiptId, txId, transferId, JSON.stringify(receiptData), now]
      );

      return receiptData;
    });

    const receiptData = perform();

    // 6. Audit log
    logAudit(req.user.userId, 'INTERBANK_TRANSFER', 'interbank_transfer', transferId, {
      amount: transferAmount, currency: safeCurrency, bank: safeBankName,
      country: safeCountry, reference: ref,
    }, req);

    // 7. Return new balance
    const updatedWallet = db.query(
      `SELECT balance FROM wallets WHERE user_id=?`, [req.user.userId]
    ).rows[0];

    res.status(201).json({
      success:    true,
      message:    'Transfer completed successfully',
      receipt:    receiptData,
      newBalance: updatedWallet?.balance ?? 0,
    });
  } catch (err) { next(err); }
};

// ── GET /api/transfers/:id/receipt ────────────────────────────────────────────
const getReceipt = async (req, res, next) => {
  try {
    const receipt = db.query(
      `SELECT r.*, it.sender_id
       FROM receipts r
       LEFT JOIN interbank_transfers it ON it.id = r.interbank_transfer_id
       WHERE r.id=? OR r.transaction_id=?`,
      [req.params.id, req.params.id]
    ).rows[0];

    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    if (req.user.role !== 'admin' && receipt.sender_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, receipt: JSON.parse(receipt.receipt_data) });
  } catch (err) { next(err); }
};

// ── GET /api/transfers  ───────────────────────────────────────────────────────
const getTransfers = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const where  = req.user.role === 'admin' ? '1=1' : `it.sender_id='${req.user.userId}'`;
    const total  = db.query(`SELECT COUNT(*) as count FROM interbank_transfers it WHERE ${where}`).rows[0].count;
    const rows   = db.query(
      `SELECT it.*, r.id as receipt_id
       FROM interbank_transfers it
       LEFT JOIN receipts r ON r.interbank_transfer_id=it.id
       WHERE ${where}
       ORDER BY it.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    ).rows;
    res.json({ success: true, transfers: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

module.exports = { getCountries, getBanks, createInterbankTransfer, getReceipt, getTransfers };
