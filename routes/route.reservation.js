const router = require('express').Router();
const { userRoles } = require('../utils/constants');
const reservationController = require('../controllers/controller.reservation');
const verifyRoles = require('../middlewares/verify_role');
const { verifySession } = require('../middlewares/verify_session');
const { getReservationsReports } = require('../queries/reservation_data');

router.get(
  '/get',
  verifySession,
  verifyRoles(userRoles.OWNER),
  reservationController.getReservations
);
router.get(
  '/myRequests',
  verifySession,
  verifyRoles(userRoles.TENANT),
  reservationController.getTenantReservations
);
router.put(
  '/approve/:id',
  verifySession,
  verifyRoles(userRoles.OWNER),
  reservationController.approveReservationRequest
);
router.put(
  '/decline/:id',
  verifySession,
  verifyRoles(userRoles.OWNER),
  reservationController.declineReservationRequest
);
router.post(
  '/request',
  verifySession,
  verifyRoles(userRoles.TENANT),
  reservationController.requestReservation
);
router.get(
  '/agreements/:id',
  verifySession,
  verifyRoles(userRoles.TENANT, userRoles.OWNER),
  reservationController.getAgreements
);
router.get(
  '/reservationReport',
  verifySession,
  verifyRoles(userRoles.ADMIN),
  async (req, res) => {
    const data = await getReservationsReports();
    res.status(200).json(data);
  }
);
router.delete(
  '/cancel/:id',
  verifySession,
  verifyRoles(userRoles.TENANT),
  reservationController.cancelReservation
);

module.exports = router;
