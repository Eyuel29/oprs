const router = require('express').Router();
const verifyRoles = require('../middlewares/verify_role');
const { userRoles } = require('../utils/constants');
const reviewController = require('../controllers/controller.review');
const { verifySession } = require('../middlewares/verify_session');
const verifyReviewEligible = require('../middlewares/verify_review_eligible');

router.get(
  '/user/:id',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.TENANT),
  reviewController.getUserReviews
);
router.get(
  '/listing/:id',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.TENANT),
  reviewController.getListingReviews
);
router.delete(
  '/delete/:id',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.TENANT),
  reviewController.deleteReview
);
router.post(
  '/create',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.TENANT),
  verifyReviewEligible,
  reviewController.createReview
);
router.get(
  '/myreviews',
  verifySession,
  verifyRoles(userRoles.OWNER, userRoles.TENANT),
  reviewController.getMyReviews
);

module.exports = router;
