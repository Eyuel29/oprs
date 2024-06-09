const router = require('express').Router();
const verifyController = require('../controllers/verify_controller');
const accountController = require('../controllers/account_controller');
const { verifyUserSession } = require('../middlewares/verify_user_session');
const verifyActive = require('../middlewares/verify_active');

router.get('/signout', verifyUserSession,accountController.signout);
router.post('/verify/:key', verifyUserSession,verifyController.verify_post);
router.get('/verify', verifyUserSession,verifyController.verify_get);

module.exports = router;