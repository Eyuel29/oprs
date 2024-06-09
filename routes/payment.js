const router  = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const ROLES_LIST = require('../config/ROLES');
const paymentController = require('../controllers/payment_controller');
const { verifyUserSession } = require('../middlewares/verify_user_session');

router.get('/getSubAccount/:id', verifyUserSession,verifyRoles(ROLES_LIST.TENANT,ROLES_LIST.LANDLORD),paymentController.getPaymentInfo);
router.post('/createSubAccount', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),paymentController.createSubAccount);
router.post('/deleteSubAccount', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),paymentController.deleteSubAccount);

router.post('/initialize', verifyUserSession,verifyRoles(ROLES_LIST.TENANT, ROLES_LIST.LANDLORD),paymentController.initialize);
router.post('/verify', verifyUserSession,verifyRoles(ROLES_LIST.TENANT),paymentController.verifyPayment);

module.exports = router;