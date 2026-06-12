const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Internal service route (called by other services)
router.post('/send',  notificationController.send);

// Customer routes
router.get('/mine', authenticate, notificationController.getMyNotifications);

// Admin routes
router.get('/', authenticate, authorize('admin'), notificationController.getAll);

module.exports = router;
