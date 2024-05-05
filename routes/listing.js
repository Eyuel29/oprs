const router  = require('express').Router();
const verifyRoles = require('../middlewares/auth/verifyRoles');
const ROLES_LIST = require('../config/ROLES');
const listingController = require('../controllers/listing/listingController');
const { verifyUserSession } = require('../middlewares/auth/verifyUserSession');

router.post('/create',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD),listingController.createListing);
router.delete('/remove/:id', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD, ROLES_LIST.ADMIN),listingController.removeListing);
router.put('/modify/:id', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD), listingController.modifyListing);
router.put('/setAvailable/:id', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD), listingController.setAvaliable);
router.put('/setUnAvailable/:id', verifyUserSession,verifyRoles(ROLES_LIST.LANDLORD), listingController.setUnAvaliable);
router.get('/page/:page',verifyUserSession,listingController.getPageListing );
router.get('/get/:id',verifyUserSession, listingController.getListing );

module.exports = router;