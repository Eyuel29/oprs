const router = require('express').Router();
const verifyRoles = require('../middlewares/verify_roles');
const Roles = require('../config/roles');
const reviewController = require('../controllers/review_controller');
const { verifySession } = require('../middlewares/verify_user_session');
const verifyReviewEligible = require('../middlewares/verify_review_eligible');

router.get(
  '/user/:id',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.TENANT),
  reviewController.getUserReviews
);
router.get(
  '/listing/:id',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.TENANT),
  reviewController.getListingReviews
);
router.delete(
  '/delete/:id',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.TENANT),
  reviewController.deleteReview
);
router.post(
  '/create',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.TENANT),
  verifyReviewEligible,
  reviewController.createReview
);
router.get(
  '/myreviews',
  verifySession,
  verifyRoles(Roles.OWNER, Roles.TENANT),
  reviewController.getMyReviews
);

module.exports = router;
