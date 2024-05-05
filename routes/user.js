const router  = require('express').Router();
const verifyRoles = require('../middlewares/auth/verifyRoles');
const ROLES_LIST = require('../config/ROLES');
const userController = require('../controllers/account/userController');
const { verifyUserSession } = require('../middlewares/auth/verifyUserSession');

router.delete('/remove/:id', verifyUserSession,verifyRoles(ROLES_LIST.ADMIN),userController.removeUser);
router.get('/page/:page',verifyUserSession,verifyRoles(ROLES_LIST.ADMIN),userController.getPageUser );
router.get('/get/:id', verifyUserSession, userController.getUser );
router.put('/suspend/:id',verifyUserSession,verifyRoles(ROLES_LIST.ADMIN),userController.suspendUser );
router.put('/activate/:id',verifyUserSession,verifyRoles(ROLES_LIST.ADMIN),userController.activateUser );

module.exports = router;