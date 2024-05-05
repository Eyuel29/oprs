const router  = require('express').Router();

// const verifyRoles = require('../middlewares/auth/verifyRoles');
// const ROLES_LIST = require('../config/ROLES');
// const paymentController = require('../controllers/reservation/paymentController');
// const { verifyUserSession } = require('../middlewares/auth/verifyUserSession');

// router.get('/bills',verifyUserSession, verifyRoles(ROLES_LIST.TENANT),paymentController. );
// router.post('/start',verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD), paymentController.approveListingReq);
// router.post('/createSubAccount', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD),paymentController.declineListingReq);
// router.post('/removeSubAccount', verifyUserSession,verifyRoles(ROLES_LIST.TENANT),paymentController.declineListingReq);

module.exports = router;