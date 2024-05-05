const reviewData = require('../../dataAccessModule/reviewData');
const sendErrorResponse = require('../../utils/sendErrorResponse');
const crypto = require('crypto');

const deleteReview = async (req, res) => {
    try {
        if( !req?.params?.id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const review_id = req?.params?.id;
        const reviewResult = await reviewData.deleteReview(review_id);
        return res.status(200).json({
            success: true,
            message: "Successfully deleted the review!",
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
            message: "Successfully loaded listing Reviews!",
            body: reviewResult
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

const createReview = async (req, res) =>{
    try {
        if( !req?.body?.author_id,
            !req?.body?.review_date,
            !req?.body?.review_message,
            !req?.body?.rating,
            !req?.body?.listing_id,
            !req?.body?.receiver_id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const {author_id,review_message,rating,listing_id,receiver_id} = req?.body;
        const review_id = crypto.randomUUID();
        const review_date = getDate();

        const reviewResult = await reviewData.createReview(
            {review_id,author_id,review_date,review_message,rating,listing_id,receiver_id}
        );

        if (reviewResult.affectedRows < 1) {
            return sendErrorResponse(res, 409, "Something went wrong!");
        }

        return res.status(200).json({
            success: true,
            message: "Review successfully sent!",
            review_id: review_id
        });

    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

module.exports = {
    deleteReview,
    getListingReviews,
    getUserReviews,
    createReview
}