const notificationData = require('../../dataAccessModule/notificationData');
const sendErrorResponse = require('../../utils/sendErrorResponse');

const getUserNotifications = async (req, res) => {
    try {
        if( !req?.params?.id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const user_id = req?.params?.id;
        const notificationResult = await notificationData.getNotifications(user_id);
        return res.status(200).json({
            success: true,
            message: "Successfully loaded notifications!",
            body: notificationResult
        });
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const getNotificationCount = async (req, res) => {
    try {
        if( !req?.params?.id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const user_id = req?.params?.id;
        const notificationCount = await notificationData.getNotificationCount(user_id);
        return res.status(200).json({
            success: true,
            message: "Successfully loaded notification count!",
            body: notificationCount
        });
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

module.exports = {
    getUserNotifications,
    getNotificationCount
}