const router = require('express').Router();
const verifyController = require('../controllers/account/verifyController');
const logoutController = require('../controllers/account/logoutController');
const { verifyUserSession } = require('../middlewares/auth/verifyUserSession');

router.get('/logout', verifyUserSession,logoutController.logout_get);
router.post('/verify', verifyUserSession,verifyController.verify_post);
router.get('/verify', verifyUserSession,verifyController.verify_get);

module.exports = router;