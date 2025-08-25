const router  = require('express').Router();
const Roles = require('../config/roles');
const reservationController = require('../controllers/reservation_controller');
const verifyRoles = require('../middlewares/verify_roles');
const { verifyUserSession } = require('../middlewares/verify_user_session');
const { getReservationsReports } = require('../data_access_module/reservation_data');

router.get('/get',verifyUserSession, verifyRoles(Roles.LANDLORD),reservationController.getReservations);
router.get('/myRequests',verifyUserSession, verifyRoles(Roles.TENANT),reservationController.getTenantReservations);
router.put('/approve/:id',verifyUserSession,verifyRoles(Roles.LANDLORD), reservationController.approveReservationRequest);
router.put('/decline/:id', verifyUserSession,verifyRoles(Roles.LANDLORD),reservationController.declineReservationRequest);
router.post('/request',verifyUserSession, verifyRoles(Roles.TENANT),reservationController.requestReservation);
router.get('/agreements/:id',verifyUserSession, verifyRoles(Roles.TENANT, Roles.LANDLORD),reservationController.getAgreements);
router.get('/reservationReport',verifyUserSession, verifyRoles(Roles.ADMIN), async (req, res) =>{
    const data = await getReservationsReports();
    res.status(200).json(data);
});
router.delete('/cancel/:id',verifyUserSession, verifyRoles(Roles.TENANT),reservationController.cancelReservation);

module.exports = router;