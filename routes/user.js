const router = require('express').Router();
const Roles = require('../config/roles');
const userController = require('../controllers/user_controller');
const verifyRoles = require('../middlewares/verify_roles');
const { verifySession } = require('../middlewares/verify_user_session');

router.delete(
  '/remove/:id',
  verifySession,
  verifyRoles(Roles.ADMIN),
  userController.removeUser
);
router.get(
  '/page/:page',
  verifySession,
  verifyRoles(Roles.ADMIN),
  userController.getAllUsers
);
router.put(
  '/suspend/:id',
  verifySession,
  verifyRoles(Roles.ADMIN),
  userController.suspendUser
);
router.put(
  '/activate/:id',
  verifySession,
  verifyRoles(Roles.ADMIN),
  userController.activateUser
);
router.get('/get/:id', verifySession, userController.getUser);

module.exports = router;
