const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, setTransactionPin, getAllUsers, getUserById, toggleUserStatus } = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/profile',    authenticate, getProfile);
router.put('/profile',    authenticate, updateProfile);
router.post('/set-pin',   authenticate, setTransactionPin);
router.get('/',           authenticate, authorizeAdmin, getAllUsers);
router.get('/:id',        authenticate, authorizeAdmin, getUserById);
router.patch('/:id/toggle-status', authenticate, authorizeAdmin, toggleUserStatus);

module.exports = router;
