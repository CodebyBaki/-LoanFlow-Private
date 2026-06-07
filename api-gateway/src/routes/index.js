const { createProxyMiddleware } = require('http-proxy-middleware');

const SERVICES = {
  CUSTOMER:     process.env.CUSTOMER_SERVICE_URL     || 'http://customer-service:3000',
  LOAN:         process.env.LOAN_SERVICE_URL         || 'http://loan-service:3000',
  CREDIT:       process.env.CREDIT_SERVICE_URL       || 'http://credit-service:3000',
  DISBURSEMENT: process.env.DISBURSEMENT_SERVICE_URL || 'http://disbursement-service:3000',
  PAYMENT:      process.env.PAYMENT_SERVICE_URL      || 'http://payment-service:3000',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000',
  MOCK_BANK:    process.env.MOCK_BANK_SERVICE_URL    || 'http://mock-bank-service:3000',
};

const proxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.status(502).json({ error: 'Service temporarily unavailable' });
      },
    },
  });

module.exports = {
  customer:     proxy(SERVICES.CUSTOMER),
  loan:         proxy(SERVICES.LOAN),
  credit:       proxy(SERVICES.CREDIT),
  disbursement: proxy(SERVICES.DISBURSEMENT),
  payment:      proxy(SERVICES.PAYMENT),
  notification: proxy(SERVICES.NOTIFICATION),
  mockBank:     proxy(SERVICES.MOCK_BANK),
};
