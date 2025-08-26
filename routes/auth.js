const router = require('express').Router();
const accountController = require('../controllers/account_controller');

router.post('/register', accountController.register);
router.post('/signin', accountController.signin);

module.exports = router;
