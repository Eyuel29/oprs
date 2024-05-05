const { getVerificationKey } = require('../../dataAccessModule/verificationData');
const {changeUserStatus} =  require('../../dataAccessModule/userData');
const sendErrorResponse = require('../../utils/sendErrorResponse');
const crypto = require('crypto');
const {getUser} = require('../../dataAccessModule/userData');
const { createVerificationKey } = require('../../dataAccessModule/verificationData');
const sendCodeToEmail = require('../auth/Emailer');

const verify_post = async (req, res)  => {
    
    if (!req.query.userId || !req.query.key) {
        return sendErrorResponse(res, 400, 'Invalid link!');
    }
    
    const userId = req.query.userId;
    const vKey = req.query.key;
    
    const retrievedKey = await getVerificationKey(vKey);
    if (!retrievedKey[0]) {
        return sendErrorResponse(res, 400, 'Invalid information!');
    }

    if (parseInt(retrievedKey[0].expires_at) <= (new Date().getTime())) {
        return sendErrorResponse(res, 408, 'Time is up try again!');
    }

    const vKeyMatches = retrievedKey[0].verification_key === parseInt(vKey);

    if (!vKeyMatches) {
        return sendErrorResponse(res, 400, 'Verification failed!');
    }

    try {
        const result = await changeUserStatus(userId ,'ACTIVE');
        console.log(result);
        if (result.affectedRows > 0) {
            return res.status(200).json({
                success : true,
                message : 'Registration successful!',
            });
        }else{
            return sendErrorResponse (res, 500, 'Internal error try again!');  
        }
    } catch (error) {
        console.log(error);
        return sendErrorResponse(res, 500, 'Internal error please try agin later.');
    }
}

const verify_get = async (req, res)  => {
    
    try {
        const userId = req?.userId;
        console.log(userId);
        if (!userId) {
            return sendErrorResponse(res, 401, 'Unauthorized');
        }
        
        const userData = await getUser(userId);
        const {email} = userData;

        const randomCode  = crypto.randomInt(999999);
        sendCodeToEmail(email,randomCode, () =>{
        });
        await createVerificationKey(
            userId,
            randomCode,
            ""+new Date().getTime(),
            ""+(new Date().getTime() + 60000 * 5));

        return res.status(200).json({
                success : true,
                message : 'Verification code sent to ' + email,
        });

    } catch (error) {
        console.log(error);
        return sendErrorResponse(res, 500, 'Internal server error!');
    }

}

module.exports = {verify_post, verify_get}