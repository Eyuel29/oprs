const router  = require('express').Router();
const ROLES_LIST = require('../config/roles');
const reservationController = require('../controllers/reservation_controller');
const verifyRoles = require('../middlewares/verify_roles');
const { verifyUserSession } = require('../middlewares/verify_user_session');

router.get('/get',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD),reservationController.getReservations);
router.get('/myRequests',verifyUserSession, verifyRoles(ROLES_LIST.TENANT),reservationController.getTenantReservations);
router.put('/approve/:id',verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD), reservationController.approveReservationRequest);
router.put('/decline/:id', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),reservationController.declineReservationRequest);
router.post('/request',verifyUserSession, verifyRoles(ROLES_LIST.TENANT),reservationController.requestReservation);
router.delete('/cancel/:id',verifyUserSession, verifyRoles(ROLES_LIST.TENANT),reservationController.cancelReservation);
router.get('/agreements/:id',verifyUserSession, verifyRoles(ROLES_LIST.TENANT, ROLES_LIST.LANDLORD),reservationController.getAgreements);

module.exports = router;