const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('./middleware/auth');
const routes = require('./routes');
require('dotenv').config();
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;

// Prometheus metrics
client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total HTTP errors',
  labelNames: ['method', 'route', 'status_code']
});


app.use((req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode
      },
      duration
    );

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode
      });
    }
  });

  next();
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.use(morgan('combined'));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Public routes
app.use('/api/auth',      routes.customer);

// Protected routes
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

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
