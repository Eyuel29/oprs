const router = require('express').Router();
const verifyRoles = require('../middlewares/verify_role');
const { userRoles } = require('../utils/constants');
const paymentController = require('../controllers/controller.payment');
const paymentData = require('../queries/payment_data');
const { verifySession } = require('../middlewares/verify_session');
const verifyActive = require('../middlewares/verify_status');

router.get(
  '/getSubAccount/:id',
  verifySession,
  verifyActive,
  verifyRoles(userRoles.TENANT, userRoles.OWNER),
  paymentController.getPaymentInfo
);
router.get(
  '/myInfo',
  verifySession,
  verifyActive,
  verifyRoles(userRoles.OWNER),
  paymentController.getMyPaymentInfo
);
router.post(
  '/createSubAccount',
  verifySession,
  verifyActive,
  verifyRoles(userRoles.OWNER),
  paymentController.createSubAccount
);
router.delete(
  '/deleteSubAccount',
  verifySession,
  verifyActive,
  verifyRoles(userRoles.OWNER),
  paymentController.deleteSubAccount
);
router.post(
  '/initialize',
  verifySession,
  verifyActive,
  verifyRoles(userRoles.TENANT),
  paymentController.initialize
);
router.get('/verify/:txref', paymentController.verifyPayment);

router.get(
  '/getAllReferences',
  verifySession,
  verifyRoles(userRoles.ADMIN),
  async (req, res) => {
    const allData = await paymentData.getAllPaymentReferences();
    res.json(allData);
  }
);

module.exports = router;
