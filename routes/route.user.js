const router = require('express').Router();
const { userRoles } = require('../utils/constants');
const userController = require('../controllers/controller.user');
const verifyRoles = require('../middlewares/verify_role');
const { verifySession } = require('../middlewares/verify_session');

router.delete(
  '/remove/:id',
  verifySession,
  verifyRoles(userRoles.ADMIN),
  userController.removeUser
);
router.get(
  '/page/:page',
  verifySession,
  verifyRoles(userRoles.ADMIN),
  userController.getAllUsers
);
router.put(
  '/suspend/:id',
  verifySession,
  verifyRoles(userRoles.ADMIN),
  userController.suspendUser
);
router.put(
  '/activate/:id',
  verifySession,
  verifyRoles(userRoles.ADMIN),
  userController.activateUser
);
router.get('/get/:id', verifySession, userController.getUser);

module.exports = router;
