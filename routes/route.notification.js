const router = require('express').Router();
const { userRoles } = require('../utils/constants');
const notificationController = require('../controllers/controller.notification');
const verifyRoles = require('../middlewares/verify_role');
const { verifySession } = require('../middlewares/verify_session');

router.get(
  '/get',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.TENANT),
  notificationController.getUserNotifications
);
router.get(
  '/count',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.TENANT),
  notificationController.getNotificationCount
);

module.exports = router;
