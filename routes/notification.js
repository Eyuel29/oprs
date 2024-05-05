const router  = require('express').Router();
const verifyRoles = require('../middlewares/auth/verifyRoles');
const ROLES_LIST = require('../config/ROLES');
const notificationController = require('../controllers/notification/notificationController');
const { verifyUserSession } = require('../middlewares/auth/verifyUserSession');

router.get('/get',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD, ROLES_LIST.TENANT),notificationController.getUserNotifications);
router.get('/count',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD, ROLES_LIST.TENANT),notificationController.getNotificationCount);

module.exports = router;