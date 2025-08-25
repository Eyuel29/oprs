const router  = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const Roles = require('../config/roles');
const reviewController = require('../controllers/review_controller');
const { verifyUserSession } = require('../middlewares/verify_user_session');
const verifyReviewEligible = require('../middlewares/verify_review_eligible');

router.get('/user/:id',verifyUserSession, verifyRoles(Roles.LANDLORD, Roles.TENANT),reviewController.getUserReviews);
router.get('/listing/:id',verifyUserSession, verifyRoles(Roles.LANDLORD, Roles.TENANT),reviewController.getListingReviews);
router.delete('/delete/:id',verifyUserSession, verifyRoles(Roles.LANDLORD, Roles.TENANT),reviewController.deleteReview);
router.post('/create',verifyUserSession, verifyRoles(Roles.LANDLORD, Roles.TENANT), verifyReviewEligible,reviewController.createReview);
router.get('/myreviews',verifyUserSession, verifyRoles(Roles.LANDLORD, Roles.TENANT),reviewController.getMyReviews);

module.exports = router;