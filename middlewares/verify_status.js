/* eslint-disable no-console */
/* eslint-disable no-undef */
const accountStatus = require('../config/account_status');
const { getUserStatus } = require('../queries/user_data');

const verifyActive = async (req, res, next) => {
  try {
    if (!req?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized!',
      });
    }

    const userId = req?.userId;
    const result = await getUserStatus(userId);

    if (!result[0]) {
      res.clearCookie('sessionId', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });

      return res.status(401).json({
        success: false,
        message: 'Unauthorized!',
      });
    }
    switch (result[0].accountStatus) {
      case accountStatus.SUSPENDED:
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended!',
        });
      case accountStatus.INACTIVE:
        return res.status(403).json({
          success: false,
          message: 'Please verify your acccount!',
        });
      case accountStatus.ACTIVE:
        next();
        break;
      default:
        return res.status(403).json({
          success: false,
          message: 'Forbidden!',
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

module.exports = verifyActive;
