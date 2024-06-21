const router  = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const ROLES_LIST = require('../config/ROLES');
const paymentController = require('../controllers/payment_controller');
const { verifyUserSession } = require('../middlewares/verify_user_session');

router.get('/getSubAccount/:id',verifyUserSession,verifyRoles(ROLES_LIST.TENANT,ROLES_LIST.LANDLORD),paymentController.getPaymentInfo);
router.get('/myInfo',verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),paymentController.getMyPaymentInfo);
router.post('/createSubAccount',verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),paymentController.createSubAccount);
router.delete('/deleteSubAccount',verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),paymentController.deleteSubAccount);
router.post('/initialize', verifyUserSession,verifyRoles(ROLES_LIST.TENANT),paymentController.initialize);
router.get('/verify',paymentController.verifyPayment);

module.exports = router;