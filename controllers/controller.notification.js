/* eslint-disable no-console */
/* eslint-disable no-undef */
const notificationData = require('../queries/notification_data');

const getUserNotifications = async (req, res) => {
  try {
    if (!req?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const userId = req?.userId;
    const notificationResult = await notificationData.getNotifications(userId);
    return res.status(200).json({
      success: true,
      message: 'Successfully loaded notifications!',
      body: notificationResult,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getNotificationCount = async (req, res) => {
  try {
    if (!req?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const userId = req?.userId;
    const notificationCount =
      await notificationData.getNotificationCount(userId);
    return res.status(200).json({
      success: true,
      message: 'Successfully loaded notification count!',
      body: notificationCount[0],
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
  getUserNotifications,
  getNotificationCount,
};
