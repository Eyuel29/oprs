const router = require('express').Router();
const registerController = require('../controllers/auth/registerController');
const loginController = require('../controllers/auth/loginController');

router.post('/register', registerController.register_post);
router.post('/signin', loginController.login_post);

module.exports = router;