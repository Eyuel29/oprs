const {
  getUserSession,
  deleteUserSession,
} = require("../queries/session_data");

const verifySession = async (req, res, next) => {
  try {
    const cookies = req?.cookies;
    if (!cookies?.session_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const cookieSessionId = cookies.session_id;
    const userSession = await getUserSession(cookieSessionId);
    const foundUserSession = userSession[0];

    if (!foundUserSession) {
      res.clearCookie("session_id");
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const expiresAt = parseInt(foundUserSession.expires_at);
    const timeNow = new Date().getTime();
    const session_expired = timeNow >= expiresAt;

    if (session_expired) {
      await deleteUserSession(foundUserSession.session_id);
      res.clearCookie("session_id");
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.userId = foundUserSession.user_id;
    req.userRole = foundUserSession.user_role;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
    });
  }
};

module.exports = { verifySession: verifySession };
