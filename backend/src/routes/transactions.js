const express = require('express');
const router = express.Router();
const { getTransactions, getTransactionById, createTransaction, getStats } = require('../controllers/transactionController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/stats', authenticate, authorizeAdmin, getStats);
router.get('/', authenticate, getTransactions);
router.get('/:id', authenticate, getTransactionById);
router.post('/', authenticate, createTransaction);

module.exports = router;
