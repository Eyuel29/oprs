const sendErrorResponse = require('../utils/sendErrorResponse');

const verifyRegistrationRole = async (req, res, next) => {
    try {
        if (
            req?.body?.user_role == 3000 ||
            req?.body?.user_role != 1000 ||
            req?.body?.user_role != 2000
        ) return sendErrorResponse(res, 403, "Forbidden");
        next();
    } catch (error) {
        console.log(error);
        return sendErrorResponse(res, 500, "Internal server error!");
    }
}

module.exports = verifyRegistrationRole;