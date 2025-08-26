const router = require('express').Router();
const Roles = require('../config/roles');
const notificationController = require('../controllers/controller.notification');
const verifyRoles = require('../middlewares/verify_role');
const { verifySession } = require('../middlewares/verify_session');

router.get(
  '/get',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.TENANT),
  notificationController.getUserNotifications
);
router.get(
  '/count',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.TENANT),
  notificationController.getNotificationCount
);

module.exports = router;
