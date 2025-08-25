const router  = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const Roles = require('../config/roles');
const paymentController = require('../controllers/payment_controller');
const paymentData = require('../data_access_module/payment_data');
const { verifyUserSession } = require('../middlewares/verify_user_session');
const verifyActive = require('../middlewares/verify_active');

router.get('/getSubAccount/:id',verifyUserSession,verifyActive,verifyRoles(Roles.TENANT,Roles.LANDLORD),paymentController.getPaymentInfo);
router.get('/myInfo',verifyUserSession,verifyActive,verifyRoles(Roles.LANDLORD),paymentController.getMyPaymentInfo);
router.post('/createSubAccount',verifyUserSession,verifyActive,verifyRoles(Roles.LANDLORD),paymentController.createSubAccount);
router.delete('/deleteSubAccount',verifyUserSession,verifyActive,verifyRoles(Roles.LANDLORD),paymentController.deleteSubAccount);
router.post('/initialize', verifyUserSession,verifyActive,verifyRoles(Roles.TENANT),paymentController.initialize);
router.get('/verify/:txref',paymentController.verifyPayment);

router.get('/getAllReferences',verifyUserSession,verifyRoles(Roles.ADMIN), async (req, res) => {
    const allData = await paymentData.getAllPaymentReferences();
    res.json(allData);
});

module.exports = router;