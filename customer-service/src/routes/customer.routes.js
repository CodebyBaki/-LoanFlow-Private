const router = require('express').Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/',    authenticate, authorize('admin'), customerController.getAllCustomers);
router.get('/me',  authenticate,                     customerController.getProfile);
router.put('/me',  authenticate,                     customerController.updateProfile);
router.get('/:id', authenticate, authorize('admin'), customerController.getProfile);

module.exports = router;
