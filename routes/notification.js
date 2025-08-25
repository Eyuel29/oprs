const router  = require('express').Router();
const Roles = require('../config/roles');
const notificationController = require('../controllers/notification_controller');
const verifyRoles = require('../middlewares/verify_roles');
const { verifySession } = require('../middlewares/verify_user_session');

router.get('/get',verifySession, verifyRoles(Roles.OWNER, Roles.TENANT),notificationController.getUserNotifications);
router.get('/count',verifySession, verifyRoles(Roles.OWNER, Roles.TENANT),notificationController.getNotificationCount);

module.exports = router;