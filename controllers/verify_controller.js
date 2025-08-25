const {
  getVerificationKey,
  createVerificationKey,
} = require("../queries/verification_data");
const { changeUserStatus, getUser } = require("../queries/user_data");

const sendCodeToEmail = require("../utils/emailer");
const accountStatus = require("../config/account_status");
const crypto = require("crypto");

const verify_post = async (req, res) => {
  const { key } = req?.params;
  const userId = req?.userId;
  if (!key || !userId) {
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

  if (!vKeyMatches) {
    res.status(400).json({
      success: false,
      message: "Verification Failed!!",
    });
  }

  try {
    const result = await changeUserStatus(userId, accountStatus.ACTIVE);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Registration successful!",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const verify_get = async (req, res) => {
  try {
    const userId = req?.userId;
    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    const userData = await getUser(userId);
    const { email } = userData;

    const randomCode = crypto.randomInt(999999);
    sendCodeToEmail(email, randomCode, async () => {});
    await createVerificationKey(
      userId,
      randomCode,
      "" + new Date().getTime(),
      "" + (new Date().getTime() + 60000 * 5)
    );

    return res.status(200).json({
      success: true,
      message: "Verification code sent to " + email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

module.exports = { verify_post, verify_get };
