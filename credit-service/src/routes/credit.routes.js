const router = require('express').Router();
const creditController = require('../controllers/credit.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// Customer routes
router.get('/my-score', authenticate, creditController.getMyScore);

// Admin / internal service routes
router.post('/assess',                     authenticate, authorize('admin'), validate(schemas.assess),      creditController.assessLoan);
router.get('/customers/:customerId/score', authenticate, authorize('admin'),                                creditController.getScoreByCustomer);
router.put('/customers/:customerId/score', authenticate, authorize('admin'), validate(schemas.updateScore), creditController.updateScore);
router.get('/loans/:loanId/assessment',    authenticate, authorize('admin'),                                creditController.getLoanAssessment);

module.exports = router;
