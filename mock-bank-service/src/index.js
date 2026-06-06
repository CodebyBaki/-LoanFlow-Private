const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const bankRoutes = require('./routes/bank.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status:    'healthy',
    service:   'mock-bank-service',
    timestamp: new Date().toISOString(),
    note:      'This is a simulated bank API for testing only',
  });
});

app.use('/api/mock-bank', bankRoutes);

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
  console.log(`🏦 Mock Bank Service running on port ${PORT}`);
  console.log(`   ⚠️  This is a simulated bank – not for production use`);
});

module.exports = app;
