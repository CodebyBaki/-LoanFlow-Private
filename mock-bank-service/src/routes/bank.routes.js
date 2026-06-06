const router = require('express').Router();
const bankController = require('../controllers/bank.controller');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Internal service routes (called by disbursement and payment services)
router.post('/transfer',       authenticate, validate(schemas.transfer), bankController.transfer);
router.post('/debit',          authenticate, validate(schemas.debit),    bankController.debit);
router.post('/verify-account', authenticate, validate(schemas.verify),   bankController.verifyAccount);

// Admin / testing routes
router.get('/accounts',                    authenticate, bankController.getAccounts);
router.get('/transactions',                authenticate, bankController.getTransactions);
router.get('/transactions/:reference',     authenticate, bankController.getTransactionByRef);

module.exports = router;
