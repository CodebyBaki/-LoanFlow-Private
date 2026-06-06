const router = require('express').Router();
const disbursementController = require('../controllers/disbursement.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Customer routes
router.get('/mine',          authenticate,                     disbursementController.getMyDisbursements);
router.get('/:id',           authenticate,                     disbursementController.getById);

// Admin routes
router.post('/',             authenticate, authorize('admin'), validate(schemas.initiate), disbursementController.initiate);
router.get('/',              authenticate, authorize('admin'), disbursementController.getAll);
router.get('/loan/:loanId',  authenticate, authorize('admin'), disbursementController.getByLoan);

module.exports = router;
