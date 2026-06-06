const { createProxyMiddleware } = require('http-proxy-middleware');

const SERVICES = {
  AUTH:         process.env.AUTH_SERVICE_URL         || 'http://customer-service:3000',
  CUSTOMER:     process.env.CUSTOMER_SERVICE_URL     || 'http://customer-service:3000',
  LOAN:         process.env.LOAN_SERVICE_URL         || 'http://loan-service:3000',
  CREDIT:       process.env.CREDIT_SERVICE_URL       || 'http://credit-service:3000',
  DISBURSEMENT: process.env.DISBURSEMENT_SERVICE_URL || 'http://disbursement-service:3000',
  PAYMENT:      process.env.PAYMENT_SERVICE_URL      || 'http://payment-service:3000',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000',
  MOCK_BANK:    process.env.MOCK_BANK_SERVICE_URL    || 'http://mock-bank-service:3000',
};

const proxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.status(502).json({ error: 'Service temporarily unavailable' });
      },
    },
  });

module.exports = {
  auth:         proxy(SERVICES.AUTH,         { '^/api/auth':          '/api/auth' }),
  customer:     proxy(SERVICES.CUSTOMER,     { '^/api/customers':     '/api/customers' }),
  loan:         proxy(SERVICES.LOAN,         { '^/api/loans':         '/api/loans' }),
  credit:       proxy(SERVICES.CREDIT,       { '^/api/credit':        '/api/credit' }),
  disbursement: proxy(SERVICES.DISBURSEMENT, { '^/api/disbursements': '/api/disbursements' }),
  payment:      proxy(SERVICES.PAYMENT,      { '^/api/payments':      '/api/payments' }),
  notification: proxy(SERVICES.NOTIFICATION, { '^/api/notifications': '/api/notifications' }),
  mockBank:     proxy(SERVICES.MOCK_BANK,    { '^/api/mock-bank':     '/api/mock-bank' }),
};
