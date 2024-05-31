const userData = require('../dataAccessModule/user_data');
const sessionData = require('../dataAccessModule/session_data');
const { createVerificationKey } = require('../dataAccessModule/verification_data');
const { handleFileUpload, uploadPhoto } = require('../dataAccessModule/upload_data');
const { getUserByEmail } = require('../dataAccessModule/user_data');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sendErrorResponse = require('../utils/sendErrorResponse');
const sendCodeToEmail = require('../utils/emailer');
const getDate = require('../utils/date');

const signout = async (req, res) => {
    
    const cookies = req.cookies;
    if (!cookies?.session_id && !req?.userId) return res.sendStatus(204); //No content
    
    const cookieSessionId = cookies.session_id;

    const result = await sessionData.deleteUserSession(cookieSessionId);

    if (result.affectedRows < 1) {
        return sendErrorResponse(res, 409, "Unable to logout!");
    }
    
    res.clearCookie('session_id', { httpOnly: true, sameSite: 'None', secure: true });
    res.status(200).json(
        {
            success: true,
            message: "Logged out successfully!",
        }
    );
}

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password){
            return sendErrorResponse(res, 400, "Please provide email and password!");
        }
    
        const foundUser = await getUserByEmail(email);
        if (!foundUser) {
            return sendErrorResponse(res, 400, "User not found!");
        }
    
        const match = await bcrypt.compare(password, foundUser.auth_string);
        if (!match) {
            return sendErrorResponse(res, 400, 'Password is invalid!');
        }

        const sessionId = crypto.randomUUID();
        const userId = foundUser?.user_id;
        const userRole = foundUser?.user_role;
        const userAgent = req.headers['user-agent'];
        const origin = req.headers.origin || "UNDEFINED";
        const createdAt = "" + new Date().getTime();
        const dayMillSec = 1000 * 60 * 60 * 24;
        const expiresAt = "" + (new Date().getTime() + dayMillSec);
        
        const result = await sessionData.createUserSession(sessionId,userId,userRole,userAgent,origin,createdAt,expiresAt);
        if (result.affectedRows < 1) {
            return sendErrorResponse(res, 409, 'Something went wrong!');
        }

        if (req?.cookies?.session_id) {
            await handleExsistingSession(req?.cookies?.session_id);
        }

        res.cookie('session_id', sessionId, { httpOnly: true, secure: true, sameSite: 'None', maxAge: (24 * 60 * 60 * 1000) });
        res.status(200).json({
            success : true,
            message : 'Login success',
            body : foundUser
        });    

    } catch (error) {
        console.log(error);
        return sendErrorResponse(res, 500, "Internal server error!");   
    }
}

const handleExsistingSession  = async (sessionId) =>{
    const foundSession = await sessionData.getUserSession(sessionId);
    if (foundSession[0]) {
        await sessionData.deleteUserSession(sessionId);
    }
}

const register = async (req, res) => {
    try{
        handleFileUpload(req, res, async (err) => {
            if (
                !req?.body?.full_name ||
                !req?.body?.gender ||
                !req?.body?.phone_number ||
                !req?.body?.email ||
                !req?.body?.zone ||
                !req?.body?.woreda ||
                !req?.body?.job_type ||
                !req?.body?.age ||
                !req?.body?.user_role ||
                !req?.body?.region ||
                !req?.body?.password ) {
                return sendErrorResponse(res, 400, 'Please provide the required information!');             
            }

            const { full_name,gender,
                phone_number,email,zone,
                woreda,job_type,age,
                region,password,user_role
            } = req?.body;

            const married = req?.body?.married ? 1 : 0;
            const account_status = 1000;
            const user_id = crypto.randomUUID();
            const date_joined = getDate();
            const users = await userData.getUserByEmail(email);

            if (users) {
                return sendErrorResponse(res, 409, 'User already exists with this email!');
            }
    
            var uploaded_file;

            if(err){
                return sendErrorResponse(res, 400, "File too large!");
            }

            if (req?.file) {
                try{
                    uploaded_file = await uploadPhoto(req?.file);
                } catch (error) {
                    console.log(error);
                    return sendErrorResponse(res, 500, "Internal server error! Couldn't upload the file!");    
                }   

                if (!uploaded_file) {
                    return sendErrorResponse(res, 500, "Internal server error! Couldn't upload the file!");    
                }
            }

            const userRegRes = await userData.createUser(
                { user_id,full_name,gender,phone_number,email,
                date_joined,zone,woreda,job_type,uploaded_file,
                age,account_status,region,married }
            );

            if (req?.socials && req?.socials.length > 0) {
                await userData.addSocials(user_id, req?.socials);
            }

            bcrypt.hash(password, 8, async (err, hash) => {
                const auth_string = hash;
                const userAuthRes = await userData.createUserAuth(user_id, auth_string, user_role);
                if(userRegRes.affectedRows < 1 || userAuthRes.affectedRows < 1){
                    return sendErrorResponse(res, 500, 'Registration failed try agin later!');
                }
            });

            const sessionId = crypto.randomUUID();
            const userId = user_id;
            const userRole = user_role;
            const userAgent = req.headers['user-agent'];
            const origin = req.headers.origin || "UNDEFINED";
            const createdAt = "" + new Date().getTime();
            const dayMillSec = 1000 * 60 * 60 * 24;
            const expiresAt = "" + (new Date().getTime() + dayMillSec);
            const sessionResult = await sessionData.createUserSession(sessionId,userId,userRole,userAgent,origin,createdAt,expiresAt);
            
            if (sessionResult.affectedRows < 1) {return sendErrorResponse(res, 409, 'Something went wrong!');}

            if (req?.cookies?.session_id) {await handleExsistingSession(req?.cookies?.session_id);}

            res.cookie('session_id', sessionId, { httpOnly: true, secure: true, sameSite: 'None', maxAge: (24 * 60 * 60 * 1000) });

            const randomCode  = crypto.randomInt(999999);

            await sendVerificationCode(res, email, randomCode);

            await createVerificationKey(
                user_id,
                randomCode,
                ""+new Date().getTime(),
                ""+(new Date().getTime() + 60000 * 5));
            return res.status(200).json({
                success : true,
                message : 'Please verify your email!',
            });
        });

    }catch(error){
        console.log(error);
        return sendErrorResponse (res, 500, 'Internal error try again!');
    }
}

const sendVerificationCode = async (res, email, randomCode) =>{
    try {
        sendCodeToEmail(email,randomCode, () =>{
        });
    } catch (error) {
        console.log(error);
        return sendErrorResponse (res, 400, 'Your email is invalid!');
    }
}

module.exports = {
    signin,
    signout,
    register
}