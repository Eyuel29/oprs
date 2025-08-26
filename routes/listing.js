const router = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const Roles = require('../config/roles');
const listingController = require('../controllers/listing_controller');
const { verifySession } = require('../middlewares/verify_user_session');

router.post(
  '/create',
  verifySession,
  verifyRoles(Roles.OWNER),
  listingController.createListing
);
router.delete(
  '/remove/:id',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.ADMIN),
  listingController.removeListing
);
router.put(
  '/modify/:id',
  verifySession,
  verifyRoles(Roles.OWNER),
  listingController.modifyListing
);
router.put(
  '/setAvailable/:id',
  verifySession,
  verifyRoles(Roles.OWNER),
  listingController.setAvaliable
);
router.put(
  '/setUnAvailable/:id',
  verifySession,
  verifyRoles(Roles.OWNER),
  listingController.setUnAvaliable
);
router.get('/page/:page', verifySession, listingController.getPageListing);
router.get(
  '/owner',
  verifySession,
  verifyRoles(Roles.OWNER),
  listingController.getOwnerListing
);
router.get(
  '/search/:page/:q',
  verifySession,
  verifyRoles(Roles.TENANT),
  listingController.getMatchingListing
);
router.get('/get/:id', verifySession, listingController.getListing);

module.exports = router;
