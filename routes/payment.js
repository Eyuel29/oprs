const router = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const Roles = require('../config/roles');
const paymentController = require('../controllers/payment_controller');
const paymentData = require('../queries/payment_data');
const { verifySession } = require('../middlewares/verify_user_session');
const verifyActive = require('../middlewares/verify_active');

router.get(
  '/getSubAccount/:id',
  verifySession,
  verifyActive,
  verifyRoles(Roles.TENANT, Roles.OWNER),
  paymentController.getPaymentInfo
);
router.get(
  '/myInfo',
  verifySession,
  verifyActive,
  verifyRoles(Roles.OWNER),
  paymentController.getMyPaymentInfo
);
router.post(
  '/createSubAccount',
  verifySession,
  verifyActive,
  verifyRoles(Roles.OWNER),
  paymentController.createSubAccount
);
router.delete(
  '/deleteSubAccount',
  verifySession,
  verifyActive,
  verifyRoles(Roles.OWNER),
  paymentController.deleteSubAccount
);
router.post(
  '/initialize',
  verifySession,
  verifyActive,
  verifyRoles(Roles.TENANT),
  paymentController.initialize
);
router.get('/verify/:txref', paymentController.verifyPayment);

router.get(
  '/getAllReferences',
  verifySession,
  verifyRoles(Roles.ADMIN),
  async (req, res) => {
    const allData = await paymentData.getAllPaymentReferences();
    res.json(allData);
  }
);

module.exports = router;
