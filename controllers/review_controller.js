const reviewData = require('../dataAccessModule/review_data');
const sendErrorResponse = require('../utils/sendErrorResponse');
const crypto = require('crypto');

const deleteReview = async (req, res) => {
    try {
        if( !req?.userId ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const author_id = !req?.userId;
        const reviewResult = await reviewData.deleteReview(author_id);
        return res.status(200).json({
            success: true,
            message: "Successfully deleted the review!",
        });
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const getUserReviews = async (req, res) => {
    try {
        if( !req?.params?.id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const user_id = req?.params?.id;
        const reviewResult = await reviewData.getUserReviews(user_id);
        return res.status(200).json({
            success: true,
            message: "Successfully loaded Reviews!",
            body: reviewResult
        });
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const getListingReviews = async (req, res) => {
    try {
        if( !req?.params?.id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const listing_id = req?.params?.id;
        const reviewResult = await reviewData.getListingReviews(listing_id);
        return res.status(200).json({
            success: true,
            message: "Successfully loaded Reviews!",
            body: reviewResult
        });
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const createReview = async (req, res) =>{
    try {
        if( !req?.body?.author_id,
            !req?.body?.review_message,
            !req?.body?.rating,
            !req?.body?.receiver_id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const {author_id,review_message,rating,author_name,receiver_id} = req?.body;
        const review_date = getDate();

        const reviewResult = await reviewData.createReview(
            {author_id,review_date,review_message,rating,author_name,receiver_id}
        );

        if (reviewResult.affectedRows < 1) {
            return sendErrorResponse(res, 409, "Something went wrong!");
        }

        return res.status(200).json({
            success: true,
            message: "Review successfully sent!"
        });

    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

module.exports = {
    deleteReview,
    getUserReviews,
    createReview,
    getListingReviews
}