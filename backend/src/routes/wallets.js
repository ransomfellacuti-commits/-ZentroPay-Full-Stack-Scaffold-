const express = require('express');
const router = express.Router();
const { getBalance, transfer, getAllWallets } = require('../controllers/walletController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/balance', authenticate, getBalance);
router.post('/transfer', authenticate, transfer);
router.get('/', authenticate, authorizeAdmin, getAllWallets);

module.exports = router;
