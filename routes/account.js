const router = require('express').Router();
const verifyController = require('../controllers/verify_controller');
const { verifyUserSession } = require('../middlewares/verify_user_session');
const verifyActive = require('../middlewares/verify_active');

router.get('/logout', verifyUserSession,verifyActive,);
router.post('/verify/:key', verifyUserSession,verifyController.verify_post);
router.get('/verify', verifyUserSession,verifyController.verify_get);

module.exports = router;