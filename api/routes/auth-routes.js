const router = require('express').Router();

const AuthController = require('../controllers/auth-controller');
const PassController = require('../controllers/password-controller');

router.post('/login', AuthController.loginUser);
router.post('/register', AuthController.registerUser);

// E-Mail Vrification
router.post('/resend', AuthController.resendToken);
router.get('/verify/:token', AuthController.verifyUser);

// Password Reset
router.post('/recover', PassController.recoverToken);
router.post('/reset/:resetToken', PassController.resetPassword);

module.exports = router;