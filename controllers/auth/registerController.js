const { createUser, createUserAuth, getUserByEmail} = require('../../dataAccessModule/userData');
const { createVerificationKey } = require('../../dataAccessModule/verificationData');
const sendErrorResponse = require('../../utils/sendErrorResponse');
const sendCodeToEmail = require('./Emailer');
const getDate = require('../../utils/date');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const register_post = async (req, res) => {
    try{

        if (!req?.body?.full_name ||
            !req?.body?.gender ||
            !req?.body?.phone_number ||
            !req?.body?.email ||
            !req?.body?.zone ||
            !req?.body?.woreda ||
            !req?.body?.job_type ||
            !req?.body?.age ||
            !req?.body?.user_role ||
            !req?.body?.region ||
            !req?.body?.married ||
            !req?.body?.password ) {
            return sendErrorResponse(res, 400, 'Please provide the required information!');             
        }

        const { full_name,gender,
            phone_number,email,zone,
            woreda,job_type,age,
            region,married,password,photo_url,user_role
        } = req?.body;

        const STATUS = 1000;
        const user_id = crypto.randomUUID();
        const date_joined = getDate();
        const users = await getUserByEmail(email);
        if (users) {
            return sendErrorResponse(res, 400, 'User already exists with this email!');
        }

        const userRegRes = await createUser([user_id,full_name,gender,phone_number,email,date_joined,zone,woreda,job_type,photo_url,age,STATUS,region,married]);

        bcrypt.hash(password, 8, async (err, hash) => {
            const auth_string = hash;
            const userAuthRes = await createUserAuth(user_id, auth_string, user_role);
            if(userRegRes.affectedRows < 1 || userAuthRes.affectedRows < 1){
                return sendErrorResponse(res, 500, 'Registration failed try agin later!');
            }
        });

        const randomCode  = crypto.randomInt(999999);
        await sendVerificationCode(email, randomCode);
        await createVerificationKey(
            userId,
            randomCode,
            ""+new Date().getTime(),
            ""+(new Date().getTime() + 60000 * 5));

        return res.status(200).json({
            success : true,
            message : 'Please verify your email!',
        });

    }catch(error){
        console.log(error);
        return sendErrorResponse (res, 500, 'Internal error try again!');
    }
}

const sendVerificationCode = async (email, randomCode) =>{
    try {
        sendCodeToEmail(email,randomCode, () =>{
        });
    } catch (error) {
        console.log(error);
    }
}

const register_get = (req, res) =>{
    return res.status(200).json({
        success : true,
        message : 'Page loaded',
    });
}

module.exports = {
    register_post,
    register_get
}