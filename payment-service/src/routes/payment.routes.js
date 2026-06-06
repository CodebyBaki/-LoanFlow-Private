const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Customer routes
router.post('/',                        authenticate,                     validate(schemas.makePayment),      paymentController.makePayment);
router.get('/mine',                     authenticate,                     paymentController.getMyPayments);
router.get('/schedule/:loanId',         authenticate,                     paymentController.getSchedule);

// Admin routes
router.post('/schedule/generate',       authenticate, authorize('admin'), validate(schemas.generateSchedule), paymentController.generateSchedule);
router.get('/',                         authenticate, authorize('admin'), paymentController.getAllPayments);
router.get('/loan/:loanId',             authenticate, authorize('admin'), paymentController.getPaymentsByLoan);

module.exports = router;
