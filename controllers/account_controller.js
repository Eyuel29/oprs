const userData = require("../queries/user_data");
const sessionData = require("../queries/session_data");
const agreementData = require("../queries/agreement_data");
const {
  createVerificationKey,
  getVerificationKey,
} = require("../queries/verification_data");
const { handleFileUpload, uploadPhoto } = require("../queries/upload_data");
const { getUserByEmail } = require("../queries/user_data");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const sendCodeToEmail = require("../utils/emailer");
const signout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.session_id && !req?.userId) return res.sendStatus(204); //No content
  const cookieSessionId = cookies.session_id;
  const result = await sessionData.deleteUserSession(cookieSessionId);
  if (result.affectedRows < 1)
    return res.status(204).json({
      success: false,
      message: "No Content!",
    });

  res.clearCookie("session_id", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.status(204).json({
    success: false,
    message: "No Content!",
  });
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });
    const foundUser = await getUserByEmail(email);
    if (!foundUser || !foundUser.user_role)
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    const match = await bcrypt.compare(password, foundUser.auth_string);
    if (!match)
      return res.status(400).json({
        success: false,
        message: "Incorrect Password!",
      });
    const sessionId = crypto.randomBytes(64).toString("hex");
    const userId = foundUser?.user_id;
    const userRole = foundUser?.user_role;
    const userAgent = req.headers["user-agent"];
    const origin = req.headers.origin || "UNDEFINED";
    const createdAt = "" + new Date().getTime();
    const dayMillSec = 1000 * 60 * 60 * 24;
    const expiresAt = "" + (new Date().getTime() + dayMillSec);

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
        message: "Internal Server Error!",
      });

    if (req?.cookies?.session_id)
      await sessionData.deleteUserSession(req?.cookies?.session_id);

    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      success: true,
      message: "Signin Successful!",
      body: foundUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const restoreAccount = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });
    const foundUser = await getUserByEmail(email);
    if (!foundUser || !foundUser.user_role)
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    const randomCode = crypto.randomInt(999999);

    await sendVerificationCode(res, email, randomCode);

    await createVerificationKey(
      foundUser.user_id,
      randomCode,
      "" + new Date().getTime(),
      "" + (new Date().getTime() + 60000 * 5)
    );

    res.status(200).json({
      success: true,
      message: "Verification Sent!",
      body: foundUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const restoreAccountVerify = async (req, res) => {
  const { key } = req?.params;
  if (!key) {
    return res.status(400).json({
      success: false,
      message: "Incomplete Information!",
    });
  }
  const retrievedKey = await getVerificationKey(key);
  if (!retrievedKey[0]) {
    return res.status(400).json({
      success: false,
      message: "Incomplete Information!",
    });
  }

  if (parseInt(retrievedKey[0].expires_at) < new Date().getTime()) {
    return res.status(408).json({
      success: false,
      message: "Key Expired, Try Again!",
    });
  }

  const vKeyMatches = retrievedKey[0].verification_key === parseInt(key);

  if (!vKeyMatches)
    return res.status(400).json({
      success: false,
      message: "Keys don't match!",
    });

  const sessionId = crypto.randomBytes(64).toString("hex");

  res.cookie("session_id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Please update your password!",
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
          "Weak Password, Make sure your password includes one number, one symbol, and one uppercase letter!",
      });

    bcrypt.hash(password1, 8, async (err, hash) => {
      const auth_string = hash;
      const userAuthRes = await userData.changeUserAuthString(
        userId,
        auth_string
      );
      if (userAuthRes.affectedRows < 1) {
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Update successful!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
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
          "Weak Password, Make sure your password includes one number, one symbol, and one uppercase letter!",
      });

    const foundUser = await userData.getUser(userId);

    if (!foundUser || !foundUser.user_role)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });

    const foundUserAuth = await userData.getUserByEmail(foundUser.email);

    const match = await bcrypt.compare(oldPassword, foundUserAuth.auth_string);

    if (!match)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });

    bcrypt.hash(password1, 8, async (err, hash) => {
      const auth_string = hash;
      const userAuthRes = await userData.changeUserAuthString(
        foundUser.user_id,
        auth_string
      );
      if (userAuthRes.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });
    });

    res.status(200).json({
      success: true,
      message: "Password updated successful!",
      body: foundUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const register = async (req, res) => {
  try {
    handleFileUpload(req, res, async (err) => {
      const profileImage = Array.from(req?.files ?? []).find(
        (e) => e.originalname == "user_profile_image"
      );
      const idImage = Array.from(req?.files ?? []).find(
        (e) => e.originalname == "user_id_image"
      );
      if (
        !req?.body?.full_name ||
        !req?.body?.gender ||
        !req?.body?.phone_number ||
        !req?.body?.date_of_birth ||
        !req?.body?.email ||
        !req?.body?.zone ||
        !req?.body?.woreda ||
        !req?.body?.job_type ||
        !req?.body?.user_role ||
        !req?.body?.region ||
        !req?.body?.id_type ||
        !req?.body?.id_number ||
        !req?.body?.password ||
        !idImage
      ) {
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });
      }

      const {
        full_name,
        date_of_birth,
        gender,
        phone_number,
        email,
        zone,
        woreda,
        job_type,
        id_type,
        id_number,
        region,
        password,
        user_role,
      } = req?.body;
      const married = req?.body?.married ? 1 : 0;
      const account_status = 2000;
      const foundUser = await getUserByEmail(email);
      if (foundUser)
        return res.status(409).json({
          success: false,
          message: "User Already Exists With This Email!",
        });

      var uploaded_file;
      if (err)
        return res.status(400).json({
          success: false,
          message: "Photos Only Jpeg | Png Type & Upto 1 MB Is Allowed!",
        });

      if (profileImage) {
        try {
          uploaded_file = await uploadPhoto(profileImage);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
        }
        if (!uploaded_file)
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
      }

      var id_photo_url;
      if (idImage) {
        try {
          id_photo_url = await uploadPhoto(idImage);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
        }
        if (!id_photo_url)
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
      }

      const userRegRes = await userData.createUser(
        {
          full_name,
          gender,
          phone_number,
          email,
          zone,
          user_role,
          woreda,
          job_type,
          id_photo_url,
          id_type,
          id_number,
          uploaded_file,
          date_of_birth,
          account_status,
          region,
          married,
        },
        [],
        uploaded_file
      );

      if (userRegRes.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });
      const new_user_id = userRegRes.insertId;

      bcrypt.hash(password, 8, async (err, hash) => {
        const auth_string = hash;
        const userAuthRes = await userData.createUserAuth(
          new_user_id,
          auth_string,
          user_role
        );
        if (userRegRes.affectedRows < 1 || userAuthRes.affectedRows < 1) {
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
        }
      });

      const sessionId = crypto.randomBytes(64).toString("hex");
      const userRole = user_role;

      const userAgent = req.headers["user-agent"];
      const origin = req.headers.origin || "UNDEFINED";
      const createdAt = "" + new Date().getTime();
      const dayMillSec = 1000 * 60 * 60 * 24;
      const expiresAt = "" + (new Date().getTime() + dayMillSec);

      const sessionResult = await sessionData.createUserSession(
        sessionId,
        new_user_id,
        userRole,
        userAgent,
        origin,
        createdAt,
        expiresAt
      );

      if (sessionResult.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });

      if (req?.cookies?.session_id)
        await sessionData.deleteUserSession(req?.cookies?.session_id);

      res.cookie("session_id", sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const randomCode = crypto.randomInt(999999);

      await sendVerificationCode(res, email, randomCode);

      await createVerificationKey(
        new_user_id,
        randomCode,
        "" + new Date().getTime(),
        "" + (new Date().getTime() + 60000 * 5)
      );

      return res.status(200).json({
        success: true,
        message: "Please verify your email!",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const modifyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    handleFileUpload(req, res, async (err) => {
      if (
        !req?.body?.full_name ||
        !req?.body?.phone_number ||
        !req?.body?.zone ||
        !req?.body?.woreda ||
        !req?.body?.job_type ||
        !req?.body?.date_of_birth ||
        !req?.body?.region
      ) {
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });
      }

      const {
        full_name,
        phone_number,
        zone,
        woreda,
        job_type,
        date_of_birth,
        region,
        married,
      } = req?.body;

      var uploaded_file;
      if (err)
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });

      if (req?.files.length > 0) {
        try {
          uploaded_file = await uploadPhoto(req?.files[0]);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
        }
        if (!uploaded_file)
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
      }

      const m = married === "Married" ? 1 : 0;

      const userRegRes = await userData.updateUser(
        userId,
        {
          full_name,
          phone_number,
          zone,
          woreda,
          job_type,
          date_of_birth,
          region,
          married: m,
        },
        uploaded_file
      );

      if (userRegRes.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });
      const updateProfile = await userData.getUser(userId);
      return res.status(200).json({
        success: true,
        message: "Account Updated!",
        updatedUser: updateProfile,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
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
      message: "Please Provide A Valid Email!",
    });
  }
};

const getUserAgreements = async (req, res) => {
  try {
    const user_id = req.params.id;
    if (!user_id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });

    const agreements = await agreementData.getAgreements(user_id);
    return res.status(200).json({
      success: true,
      message: "Loading user's agreements!",
      body: agreements,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getMyAgreements = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });

    const agreements = await agreementData.getAgreements(user_id);
    return res.status(200).json({
      success: true,
      message: "Loading your agreements!",
      body: agreements,
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
