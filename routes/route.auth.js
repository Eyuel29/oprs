const router = require('express').Router();
const accountController = require('../controllers/controller.account');

router.post('/register', accountController.register);
router.post('/signin', accountController.signin);

module.exports = router;
