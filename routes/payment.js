const router  = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const ROLES_LIST = require('../config/ROLES');
const paymentController = require('../controllers/payment_controller');
const { verifyUserSession } = require('../middlewares/verify_user_session');
const verifyActive = require('../middlewares/verify_active');

router.get('/getSubAccount/:id',verifyUserSession,verifyActive,verifyRoles(ROLES_LIST.TENANT,ROLES_LIST.LANDLORD),paymentController.getPaymentInfo);
router.get('/myInfo',verifyUserSession,verifyActive,verifyRoles(ROLES_LIST.LANDLORD),paymentController.getMyPaymentInfo);
router.post('/createSubAccount',verifyUserSession,verifyActive,verifyRoles(ROLES_LIST.LANDLORD),paymentController.createSubAccount);
router.delete('/deleteSubAccount',verifyUserSession,verifyActive,verifyRoles(ROLES_LIST.LANDLORD),paymentController.deleteSubAccount);
router.post('/initialize', verifyUserSession,verifyActive,verifyRoles(ROLES_LIST.TENANT),paymentController.initialize);
router.get('/verify',paymentController.verifyPayment);

module.exports = router;