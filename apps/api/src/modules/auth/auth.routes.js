const express = require('express');

const validateRequest = require('../../middleware/validate.middleware');
const authMiddleware = require('../../middleware/auth.middleware');
const { loginRateLimiter } = require('../../middleware/rateLimiter.middleware');
const authController = require('./auth.controller');
const {
    registerValidator,
    loginValidator,
    updateMeValidator,
    changePasswordValidator,
    refreshValidator,
} = require('./auth.validator');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginRateLimiter, loginValidator, validateRequest, authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.put('/me', authMiddleware, updateMeValidator, validateRequest, authController.updateMe);
router.put('/me/password', authMiddleware, changePasswordValidator, validateRequest, authController.changePassword);
router.post('/refresh', refreshValidator, validateRequest, authController.refresh);

module.exports = router;
