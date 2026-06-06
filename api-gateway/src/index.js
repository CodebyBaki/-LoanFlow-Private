const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('./middleware/auth');
const routes = require('./routes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', routes.auth);

app.use('/api/customers',     authenticate, routes.customer);
app.use('/api/loans',         authenticate, routes.loan);
app.use('/api/credit',        authenticate, routes.credit);
app.use('/api/disbursements', authenticate, routes.disbursement);
app.use('/api/payments',      authenticate, routes.payment);
app.use('/api/notifications', authenticate, routes.notification);
app.use('/api/mock-bank',     authenticate, routes.mockBank);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
