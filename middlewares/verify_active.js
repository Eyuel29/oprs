const {getUserStatus} = require('../dataAccessModule/user_data');
const sendErrorResponse = require('../utils/sendErrorResponse');

const verifyActive = async (req, res, next) => {

    try {
        if (!req?.userId) return sendErrorResponse(res, 401, "Unauthorized!");
        const userId = req?.userId;
        const result = await getUserStatus(userId);
        if (!result[0]) return sendErrorResponse(res, 500, "Internal server error!");
        console.log(result[0]);
        switch (result[0].account_status) {
            case 1000:
                return sendErrorResponse(res, 403, "Your account has been suspended!");
            case 2000:
                return sendErrorResponse(res, 403, "Please verify your acccount");
            case 3000:
                next();
            break;
            default:
                next();
                break;
        }
    } catch (error) {
        return sendErrorResponse(res, 500, "Internal server error!");
    }
}

module.exports = verifyActive