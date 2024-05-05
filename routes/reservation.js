const router  = require('express').Router();
const verifyRoles = require('../middlewares/auth/verifyRoles');
const ROLES_LIST = require('../config/ROLES');
const reservationController = require('../controllers/reservation/reservation_controller');
const { verifyUserSession } = require('../middlewares/auth/verifyUserSession');

router.get('/get',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD),reservationController.getRequests);
router.put('/approve/:id',verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD), reservationController.approveReservationRequest);
router.put('/decline/:id', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),reservationController.declineReservationRequest);
router.post('/request',verifyUserSession, verifyRoles(ROLES_LIST.TENANT),reservationController.requestReservation);
router.delete('/cancel/:id',verifyUserSession, verifyRoles(ROLES_LIST.TENANT),reservationController.cancelReservation);

module.exports = router;