const router = require('express').Router();
const loanController = require('../controllers/loan.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Public calculator
router.get('/calculate', loanController.calculateRepayment);

// Customer routes
router.post('/',     authenticate,                     validate(schemas.applyLoan),  loanController.applyForLoan);
router.get('/mine',  authenticate,                                                   loanController.getMyLoans);
router.get('/:id',   authenticate,                                                   loanController.getLoanById);

// Admin routes
router.get('/',              authenticate, authorize('admin'), loanController.getAllLoans);
router.patch('/:id/review',  authenticate, authorize('admin'), validate(schemas.reviewLoan), loanController.reviewLoan);

module.exports = router;
