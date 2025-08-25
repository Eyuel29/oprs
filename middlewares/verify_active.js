const { getUserStatus } = require("../queries/user_data");


const verifyActive = async (req, res, next) => {
  try {
    if (!req?.userId)
      return res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    const userId = req?.userId;
    const result = await getUserStatus(userId);

    if (!result[0])
      return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
      });
    switch (result[0].account_status) {
      case 1000:
        return res.status(403).json({
          success: false,
          message: "Please verify your acccount!",
        });
      case 2000:
        return res.status(403).json({
          success: false,
          message: "Your account has been suspended!",
        });
      case 3000:
        next();
        break;
      default:
        return res.status(403).json({
          success: false,
          message: "Forbidden!",
        });
        break;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

module.exports = verifyActive;
