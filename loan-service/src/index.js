const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const loanRoutes = require('./routes/loan.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'loan-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/loans', loanRoutes);

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
  console.log(`🚀 Loan Service running on port ${PORT}`);
});

module.exports = app;
