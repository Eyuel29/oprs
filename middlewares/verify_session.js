/* eslint-disable no-console */
/* eslint-disable no-undef */
const {
  getUserSession,
  deleteUserSession,
} = require('../queries/session_data');

const verifySession = async (req, res, next) => {
  try {
    const cookies = req?.cookies;
    if (!cookies?.sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    const cookieSessionId = cookies.sessionId;
    const userSession = await getUserSession(cookieSessionId);
    const foundUserSession = userSession[0];

    if (!foundUserSession) {
      res.clearCookie('sessionId');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const expiresAt = parseInt(foundUserSession.expiresAt);
    const timeNow = new Date().getTime();
    const sessionExpired = timeNow >= expiresAt;

    if (sessionExpired) {
      await deleteUserSession(foundUserSession.sessionId);
      res.clearCookie('sessionId');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    req.userId = foundUserSession.userId;
    req.userRole = foundUserSession.role;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

module.exports = { verifySession: verifySession };
