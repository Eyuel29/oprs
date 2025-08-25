const { getDate } = require("../utils/date");
const reviewData = require("../queries/review_data");
const { getUser } = require("../queries/user_data");


const deleteReview = async (req, res) => {
  try {
    if (!req?.userId || !req?.params?.id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });

    const author_id = req?.userId;
    const review_id = req?.params?.id;
    const reviewResult = await reviewData.deleteReview(author_id, review_id);

    if (reviewResult.affectedRows < 1)
      return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
      });

    return res.status(200).json({
      success: true,
      message: "Successfully deleted the review!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getUserReviews = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });
    }
    const user_id = req?.params?.id;

    const reviewResult = await reviewData.getUserReviews(user_id);
    return res.status(200).json({
      success: true,
      message: "Successfully loaded Reviews!",
      body: reviewResult,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    if (!req?.userId)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });
    const user_id = req?.userId;
    const reviewResult = await reviewData.getUserReviews(user_id);

    return res.status(200).json({
      success: true,
      message: "Successfully loaded Reviews!",
      body: reviewResult,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getListingReviews = async (req, res) => {
  try {
    if (!req?.params?.id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });
    const listing_id = req?.params?.id;
    const reviewResult = await reviewData.getListingReviews(listing_id);

    return res.status(200).json({
      success: true,
      message: "Successfully loaded Reviews!",
      body: reviewResult,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const createReview = async (req, res) => {
  try {
    if (
      !req?.body?.review_message ||
      !req?.body?.rating ||
      !req?.body?.receiver_id ||
      !req?.body?.author_name
    )
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });

    const author_id = req?.userId;
    const {
      review_message,
      rating,
      reviewed_listing_id,
      author_name,
      receiver_id,
    } = req?.body;

    const userToReview = await getUser(receiver_id);
    if (userToReview.user_id == author_id) return res.status(403).json({
        success: false,
        message: "Forbidden!",
    });

    const reviewResult = await reviewData.createReview({
      author_id,
      review_message,
      rating,
      author_name,
      receiver_id,
      reviewed_listing_id,
    });

    if (reviewResult.affectedRows < 1) return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
    });

    return res.status(200).json({
      success: true,
      message: "Review successfully sent!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
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
