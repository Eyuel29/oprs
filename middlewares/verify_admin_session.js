/* eslint-disable no-console */
/* eslint-disable no-undef */

const {
  getUserSession,
  deleteUserSession,
} = require('../queries/session_data');
const verifyAdminSession = async (req, res, next) => {
  try {
    const cookies = req?.cookies;
    if (!cookies?.sessionId) {
      res.redirect('/admin/signin');
      return;
    }
    const cookieSessionId = cookies.sessionId;
    const userSession = await getUserSession(cookieSessionId);
    const foundUserSession = userSession[0];

    if (!foundUserSession) {
      res.clearCookie('sessionId');
      res.redirect('/admin/signin');
      return;
    }

    const expiresAt = parseInt(foundUserSession.expiresAt);
    const timeNow = new Date().getTime();
    const sessionExpired = timeNow >= expiresAt;

    if (sessionExpired) {
      await deleteUserSession(foundUserSession.sessionId);
      res.clearCookie('sessionId');
      res.redirect('/admin/signin');
      return;
    }

    req.userId = foundUserSession.userId;
    req.userRole = foundUserSession.role;

    next();
  } catch (error) {
    console.log(error);
    res.redirect('/admin/signin');
    return;
  }
};

module.exports = { verifyAdminSession };
