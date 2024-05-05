const router  = require('express').Router();
const verifyRoles = require('../middlewares/auth/verifyRoles');
const ROLES_LIST = require('../config/ROLES');
const reviewController = require('../controllers/review/reviewController');
const { verifyUserSession } = require('../middlewares/auth/verifyUserSession');

router.get('/user/:id',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD, ROLES_LIST.TENANT),reviewController.getUserReviews);
router.get('/listing/:id',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD, ROLES_LIST.TENANT),reviewController.getListingReviews);
router.delete('/delete/:id',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD, ROLES_LIST.TENANT),reviewController.deleteReview);
router.post('/create',verifyUserSession, verifyRoles(ROLES_LIST.LANDLORD, ROLES_LIST.TENANT),reviewController.createReview);

module.exports = router;