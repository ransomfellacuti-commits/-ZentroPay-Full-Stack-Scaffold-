require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/wallets',      require('./routes/wallets'));

// Health checks
app.get('/health', (req, res) => res.json({
  status: 'ok', service: 'zentropay-backend',
  timestamp: new Date().toISOString()
}));
app.get('/ready', async (req, res) => {
  try {
    const db = require('./config/database');
    db.query('SELECT 1');
    res.json({ status: 'ready', db: 'connected' });
  } catch (e) {
    res.status(503).json({ status: 'not ready', db: 'disconnected' });
  }
});

// Serve React frontend static files
const distPath = path.join(__dirname, '../../admin-dashboard/dist');
app.use(express.static(distPath));

// React SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use(errorHandler);

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ZentroPay running on http://0.0.0.0:${PORT}`);
  console.log(`   API:       http://0.0.0.0:${PORT}/api`);
  console.log(`   Dashboard: http://0.0.0.0:${PORT}/`);
  console.log(`   Health:    http://0.0.0.0:${PORT}/health`);
  console.log(`   Env:       ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
