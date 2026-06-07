const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8080;

const SERVICES = {
  CUSTOMER:     process.env.CUSTOMER_SERVICE_URL     || 'http://customer-service:3000',
  LOAN:         process.env.LOAN_SERVICE_URL         || 'http://loan-service:3000',
  CREDIT:       process.env.CREDIT_SERVICE_URL       || 'http://credit-service:3000',
  DISBURSEMENT: process.env.DISBURSEMENT_SERVICE_URL || 'http://disbursement-service:3000',
  PAYMENT:      process.env.PAYMENT_SERVICE_URL      || 'http://payment-service:3000',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000',
  MOCK_BANK:    process.env.MOCK_BANK_SERVICE_URL    || 'http://mock-bank-service:3000',
};

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan('combined'));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error(`[PROXY ERROR] ${err.message}`);
      res.status(502).json({ error: 'Service temporarily unavailable' });
    },
  },
});

// ── Public routes (no auth) ───────────────────────────────────────────────────
app.use('/api/auth', createProxyMiddleware(proxyOptions(SERVICES.CUSTOMER)));

// ── Protected routes (JWT required) ──────────────────────────────────────────
app.use('/api/customers',     authenticate, createProxyMiddleware(proxyOptions(SERVICES.CUSTOMER)));
app.use('/api/loans',         authenticate, createProxyMiddleware(proxyOptions(SERVICES.LOAN)));
app.use('/api/credit',        authenticate, createProxyMiddleware(proxyOptions(SERVICES.CREDIT)));
app.use('/api/disbursements', authenticate, createProxyMiddleware(proxyOptions(SERVICES.DISBURSEMENT)));
app.use('/api/payments',      authenticate, createProxyMiddleware(proxyOptions(SERVICES.PAYMENT)));
app.use('/api/notifications', authenticate, createProxyMiddleware(proxyOptions(SERVICES.NOTIFICATION)));
app.use('/api/mock-bank',     authenticate, createProxyMiddleware(proxyOptions(SERVICES.MOCK_BANK)));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
