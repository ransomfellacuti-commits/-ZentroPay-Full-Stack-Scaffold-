const express = require('express');
const router  = express.Router();
const {
  getCountries,
  getBanks,
  createInterbankTransfer,
  getReceipt,
  getTransfers,
} = require('../controllers/interbankController');
const { authenticate } = require('../middleware/auth');

router.get('/countries',       authenticate, getCountries);   // legacy compat
router.get('/banks',           authenticate, getBanks);       // new flat search
router.get('/',                authenticate, getTransfers);
router.post('/',               authenticate, createInterbankTransfer);
router.get('/:id/receipt',     authenticate, getReceipt);

module.exports = router;
