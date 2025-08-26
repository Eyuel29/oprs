const userData = require('../queries/user_data');
const sessionData = require('../queries/session_data');
const agreementData = require('../queries/agreement_data');
const {
  createVerificationKey,
  getVerificationKey,
} = require('../queries/verification_data');
const { handleFileUpload, uploadPhoto } = require('../queries/upload_data');
const { getUserByEmail } = require('../queries/user_data');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const sendCodeToEmail = require('../utils/emailer');
const signout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.sessionId && !req?.userId) return res.sendStatus(204); //No content
  const cookieSessionId = cookies.sessionId;
  const result = await sessionData.deleteUserSession(cookieSessionId);
  if (result.affectedRows < 1)
    return res.status(204).json({
      success: false,
      message: 'No Content!',
    });

  res.clearCookie('sessionId', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });

  res.status(204).json({
    success: false,
    message: 'No Content!',
  });
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    const foundUser = await getUserByEmail(email);
    if (!foundUser || !foundUser.role)
      return res.status(404).json({
        success: false,
        message: 'User Not Found!',
      });
    const match = await bcrypt.compare(password, foundUser.authString);
    if (!match)
      return res.status(400).json({
        success: false,
        message: 'Incorrect Password!',
      });
    const sessionId = crypto.randomBytes(64).toString('hex');
    const userId = foundUser?.userId;
    const userRole = foundUser?.role;
    const userAgent = req.headers['user-agent'];
    const origin = req.headers.origin || 'UNDEFINED';
    const createdAt = '' + new Date().getTime();
    const dayMillSec = 1000 * 60 * 60 * 24;
    const expiresAt = '' + (new Date().getTime() + dayMillSec);

    const result = await sessionData.createUserSession(
      sessionId,
      userId,
      userRole,
      userAgent,
      origin,
      createdAt,
      expiresAt
    );
    if (result.affectedRows < 1)
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });

    if (req?.cookies?.sessionId)
      await sessionData.deleteUserSession(req?.cookies?.sessionId);

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      message: 'Signin Successful!',
      body: foundUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const restoreAccount = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    const foundUser = await getUserByEmail(email);
    if (!foundUser || !foundUser.role)
      return res.status(404).json({
        success: false,
        message: 'User Not Found!',
      });
    const randomCode = crypto.randomInt(999999);

    await sendVerificationCode(res, email, randomCode);

    await createVerificationKey(
      foundUser.userId,
      randomCode,
      '' + new Date().getTime(),
      '' + (new Date().getTime() + 60000 * 5)
    );

    res.status(200).json({
      success: true,
      message: 'Verification Sent!',
      body: foundUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const restoreAccountVerify = async (req, res) => {
  const { key } = req?.params;
  if (!key) {
    return res.status(400).json({
      success: false,
      message: 'Incomplete Information!',
    });
  }
  const retrievedKey = await getVerificationKey(key);
  if (!retrievedKey[0]) {
    return res.status(400).json({
      success: false,
      message: 'Incomplete Information!',
    });
  }

  if (parseInt(retrievedKey[0].expiresAt) < new Date().getTime()) {
    return res.status(408).json({
      success: false,
      message: 'Key Expired, Try Again!',
    });
  }

  const vKeyMatches = retrievedKey[0].verificationKey === parseInt(key);

  if (!vKeyMatches)
    return res.status(400).json({
      success: false,
      message: "Keys don't match!",
    });

  const sessionId = crypto.randomBytes(64).toString('hex');

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Please update your password!',
  });
};

const restoreAccountPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { password1, password2 } = req.body;

    if (!password1 || !password2 || password1 != password2)
      return res.status(400).json({
        success: false,
        message:
          'Weak Password, Make sure your password includes one number, one symbol, and one uppercase letter!',
      });

    bcrypt.hash(password1, 8, async (err, hash) => {
      const authString = hash;
      const userAuthRes = await userData.changeUserAuthString(
        userId,
        authString
      );
      if (userAuthRes.affectedRows < 1) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Update successful!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, password1, password2 } = req.body;
    const userId = req.userId;

    if (!oldPassword || !password1 || !password2 || password1 != password2)
      return res.status(400).json({
        success: false,
        message:
          'Weak Password, Make sure your password includes one number, one symbol, and one uppercase letter!',
      });

    const foundUser = await userData.getUser(userId);

    if (!foundUser || !foundUser.role)
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });

    const foundUserAuth = await userData.getUserByEmail(foundUser.email);

    const match = await bcrypt.compare(oldPassword, foundUserAuth.authString);

    if (!match)
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });

    bcrypt.hash(password1, 8, async (err, hash) => {
      const authString = hash;
      const userAuthRes = await userData.changeUserAuthString(
        foundUser.userId,
        authString
      );
      if (userAuthRes.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successful!',
      body: foundUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const register = async (req, res) => {
  try {
    handleFileUpload(req, res, async (err) => {
      const profileImage = Array.from(req?.files ?? []).find(
        (e) => e.originalname == 'user_profile_image'
      );
      const idImage = Array.from(req?.files ?? []).find(
        (e) => e.originalname == 'userId_image'
      );
      if (
        !req?.body?.fullName ||
        !req?.body?.gender ||
        !req?.body?.phoneNumber ||
        !req?.body?.dateOfBirth ||
        !req?.body?.email ||
        !req?.body?.zone ||
        !req?.body?.woreda ||
        !req?.body?.jobType ||
        !req?.body?.role ||
        !req?.body?.region ||
        !req?.body?.idType ||
        !req?.body?.idNumber ||
        !req?.body?.password ||
        !idImage
      ) {
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });
      }

      const {
        fullName,
        dateOfBirth,
        gender,
        phoneNumber,
        email,
        zone,
        woreda,
        jobType,
        idType,
        idNumber,
        region,
        password,
        role,
      } = req?.body;
      const married = req?.body?.married ? 1 : 0;
      const accountStatus = 'inactive';
      const foundUser = await getUserByEmail(email);
      if (foundUser)
        return res.status(409).json({
          success: false,
          message: 'User Already Exists With This Email!',
        });

      var uploaded_file;
      if (err)
        return res.status(400).json({
          success: false,
          message: 'Photos Only Jpeg | Png Type & Upto 1 MB Is Allowed!',
        });

      if (profileImage) {
        try {
          uploaded_file = await uploadPhoto(profileImage);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
        }
        if (!uploaded_file)
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
      }

      var idPhotoUrl;
      if (idImage) {
        try {
          idPhotoUrl = await uploadPhoto(idImage);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
        }
        if (!idPhotoUrl)
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
      }

      const userRegRes = await userData.createUser(
        {
          fullName,
          gender,
          phoneNumber,
          email,
          zone,
          role,
          woreda,
          jobType,
          idPhotoUrl,
          idType,
          idNumber,
          uploaded_file,
          dateOfBirth,
          accountStatus,
          region,
          married,
        },
        [],
        uploaded_file
      );

      if (userRegRes.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      const new_userId = userRegRes.insertId;

      bcrypt.hash(password, 8, async (err, hash) => {
        const authString = hash;
        const userAuthRes = await userData.createUserAuth(
          new_userId,
          authString,
          role
        );
        if (userRegRes.affectedRows < 1 || userAuthRes.affectedRows < 1) {
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
        }
      });

      const sessionId = crypto.randomBytes(64).toString('hex');
      const userRole = role;

      const userAgent = req.headers['user-agent'];
      const origin = req.headers.origin || 'UNDEFINED';
      const createdAt = '' + new Date().getTime();
      const dayMillSec = 1000 * 60 * 60 * 24;
      const expiresAt = '' + (new Date().getTime() + dayMillSec);

      const sessionResult = await sessionData.createUserSession(
        sessionId,
        new_userId,
        userRole,
        userAgent,
        origin,
        createdAt,
        expiresAt
      );

      if (sessionResult.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });

      if (req?.cookies?.sessionId)
        await sessionData.deleteUserSession(req?.cookies?.sessionId);

      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000,
      });

      const randomCode = crypto.randomInt(999999);

      await sendVerificationCode(res, email, randomCode);

      await createVerificationKey(
        new_userId,
        randomCode,
        '' + new Date().getTime(),
        '' + (new Date().getTime() + 60000 * 5)
      );

      return res.status(200).json({
        success: true,
        message: 'Please verify your email!',
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const modifyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    handleFileUpload(req, res, async (err) => {
      if (
        !req?.body?.fullName ||
        !req?.body?.phoneNumber ||
        !req?.body?.zone ||
        !req?.body?.woreda ||
        !req?.body?.jobType ||
        !req?.body?.dateOfBirth ||
        !req?.body?.region
      ) {
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });
      }

      const {
        fullName,
        phoneNumber,
        zone,
        woreda,
        jobType,
        dateOfBirth,
        region,
        married,
      } = req?.body;

      var uploaded_file;
      if (err)
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });

      if (req?.files.length > 0) {
        try {
          uploaded_file = await uploadPhoto(req?.files[0]);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
        }
        if (!uploaded_file)
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
      }

      const m = married === 'Married' ? 1 : 0;

      const userRegRes = await userData.updateUser(
        userId,
        {
          fullName,
          phoneNumber,
          zone,
          woreda,
          jobType,
          dateOfBirth,
          region,
          married: m,
        },
        uploaded_file
      );

      if (userRegRes.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      const updateProfile = await userData.getUser(userId);
      return res.status(200).json({
        success: true,
        message: 'Account Updated!',
        updatedUser: updateProfile,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const sendVerificationCode = async (res, email, randomCode) => {
  try {
    sendCodeToEmail(email, randomCode, () => {});
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: 'Please Provide A Valid Email!',
    });
  }
};

const getUserAgreements = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId)
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });

    const agreements = await agreementData.getAgreements(userId);
    return res.status(200).json({
      success: true,
      message: "Loading user's agreements!",
      body: agreements,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getMyAgreements = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });

    const agreements = await agreementData.getAgreements(userId);
    return res.status(200).json({
      success: true,
      message: 'Loading your agreements!',
      body: agreements,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

module.exports = {
  signin,
  signout,
  register,
  getUserAgreements,
  getMyAgreements,
  restoreAccount,
  restoreAccountVerify,
  restoreAccountPassword,
  changePassword,
  modifyProfile,
};
