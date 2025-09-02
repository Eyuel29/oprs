const router = require('express').Router();
const verifyRoles = require('../middlewares/verify_role');
const { userRoles } = require('../utils/constants');
const listingController = require('../controllers/controller.listing');
const { verifySession } = require('../middlewares/verify_session');

router.post(
  '/create',
  verifySession,
  verifyRoles(userRoles.OWNER),
  listingController.createListing
);
router.delete(
  '/remove/:id',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.ADMIN),
  listingController.removeListing
);
router.put(
  '/modify/:id',
  verifySession,
  verifyRoles(userRoles.OWNER),
  listingController.modifyListing
);
router.put(
  '/setAvailable/:id',
  verifySession,
  verifyRoles(userRoles.OWNER),
  listingController.setAvaliable
);
router.put(
  '/setUnAvailable/:id',
  verifySession,
  verifyRoles(userRoles.OWNER),
  listingController.setUnAvaliable
);
router.get('/page/:page', verifySession, listingController.getPageListing);
router.get(
  '/owner',
  verifySession,
  verifyRoles(userRoles.OWNER),
  listingController.getOwnerListing
);
router.get(
  '/search/:page/:q',
  verifySession,
  verifyRoles(userRoles.TENANT),
  listingController.getMatchingListing
);
router.get('/get/:id', verifySession, listingController.getListing);

module.exports = router;
