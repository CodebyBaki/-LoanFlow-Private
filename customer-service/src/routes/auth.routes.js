const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.post('/register', validate(schemas.register), authController.register);
router.post('/login',    validate(schemas.login),    authController.login);
router.get('/me',        authenticate,               authController.me);

module.exports = router;
