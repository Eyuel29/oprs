const router  = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const Roles = require('../config/roles');
const listingController = require('../controllers/listing_controller');
const { verifyUserSession } = require('../middlewares/verify_user_session');

router.post('/create',verifyUserSession, verifyRoles(Roles.LANDLORD),listingController.createListing);
router.delete('/remove/:id', verifyUserSession,verifyRoles(Roles.LANDLORD, Roles.ADMIN),listingController.removeListing);
router.put('/modify/:id', verifyUserSession,verifyRoles(Roles.LANDLORD), listingController.modifyListing);
router.put('/setAvailable/:id', verifyUserSession,verifyRoles(Roles.LANDLORD), listingController.setAvaliable);
router.put('/setUnAvailable/:id', verifyUserSession,verifyRoles(Roles.LANDLORD), listingController.setUnAvaliable);
router.get('/page/:page',verifyUserSession,listingController.getPageListing );
router.get('/owner',verifyUserSession,verifyRoles(Roles.LANDLORD), listingController.getOwnerListing);
router.get('/search/:page/:q',verifyUserSession,verifyRoles(Roles.TENANT), listingController.getMatchingListing);
router.get('/get/:id',verifyUserSession,listingController.getListing);

module.exports = router;