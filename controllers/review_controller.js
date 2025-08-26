/* eslint-disable no-unsafe-optional-chaining */
const reviewData = require('../queries/review_data');
const { getUser } = require('../queries/user_data');

const deleteReview = async (req, res) => {
  try {
    if (!req?.userId || !req?.params?.id) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const authorId = req?.userId;
    const reviewId = req?.params?.id;
    const reviewResult = await reviewData.deleteReview(authorId, reviewId);

    if (reviewResult.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted the review!',
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getUserReviews = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const userId = req?.params?.id;

    const reviewResult = await reviewData.getUserReviews(userId);
    return res.status(200).json({
      success: true,
      message: 'Successfully loaded Reviews!',
      body: reviewResult,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    if (!req?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const userId = req?.userId;
    const reviewResult = await reviewData.getUserReviews(userId);

    return res.status(200).json({
      success: true,
      message: 'Successfully loaded Reviews!',
      body: reviewResult,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getListingReviews = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const listingId = req?.params?.id;
    const reviewResult = await reviewData.getListingReviews(listingId);

    return res.status(200).json({
      success: true,
      message: 'Successfully loaded Reviews!',
      body: reviewResult,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const createReview = async (req, res) => {
  try {
    if (
      !req?.body?.reviewMessage ||
      !req?.body?.rating ||
      !req?.body?.receiverId ||
      !req?.body?.authorName
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const authorId = req?.userId;
    const { reviewMessage, rating, reviewedListingId, authorName, receiverId } =
      req?.body;

    const userToReview = await getUser(receiverId);
    if (userToReview.userId === authorId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden!',
      });
    }

    const reviewResult = await reviewData.createReview({
      authorId,
      reviewMessage,
      rating,
      authorName,
      receiverId,
      reviewedListingId,
    });

    if (reviewResult.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review successfully sent!',
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

module.exports = {
  deleteReview,
  getUserReviews,
  createReview,
  getMyReviews,
  getListingReviews,
};
