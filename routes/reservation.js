const router = require('express').Router();
const Roles = require('../config/roles');
const reservationController = require('../controllers/reservation_controller');
const verifyRoles = require('../middlewares/verify_roles');
const { verifySession } = require('../middlewares/verify_user_session');
const { getReservationsReports } = require('../queries/reservation_data');

router.get(
  '/get',
  verifySession,
  verifyRoles(Roles.OWNER),
  reservationController.getReservations
);
router.get(
  '/myRequests',
  verifySession,
  verifyRoles(Roles.TENANT),
  reservationController.getTenantReservations
);
router.put(
  '/approve/:id',
  verifySession,
  verifyRoles(Roles.OWNER),
  reservationController.approveReservationRequest
);
router.put(
  '/decline/:id',
  verifySession,
  verifyRoles(Roles.OWNER),
  reservationController.declineReservationRequest
);
router.post(
  '/request',
  verifySession,
  verifyRoles(Roles.TENANT),
  reservationController.requestReservation
);
router.get(
  '/agreements/:id',
  verifySession,
  verifyRoles(Roles.TENANT, Roles.OWNER),
  reservationController.getAgreements
);
router.get(
  '/reservationReport',
  verifySession,
  verifyRoles(Roles.ADMIN),
  async (req, res) => {
    const data = await getReservationsReports();
    res.status(200).json(data);
  }
);
router.delete(
  '/cancel/:id',
  verifySession,
  verifyRoles(Roles.TENANT),
  reservationController.cancelReservation
);

module.exports = router;
