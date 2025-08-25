const router  = require('express').Router();
const Roles = require('../config/roles');
const notificationController = require('../controllers/notification_controller');
const verifyRoles = require('../middlewares/verify_roles');
const { verifyUserSession } = require('../middlewares/verify_user_session');

router.get('/get',verifyUserSession, verifyRoles(Roles.LANDLORD, Roles.TENANT),notificationController.getUserNotifications);
router.get('/count',verifyUserSession, verifyRoles(Roles.LANDLORD, Roles.TENANT),notificationController.getNotificationCount);

module.exports = router;