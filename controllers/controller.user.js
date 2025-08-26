/* eslint-disable no-undef */
/* eslint-disable no-console */

const userData = require('../queries/user_data');

const accountStatus = require('../config/accountStatus');

const removeUser = async (req, res) => {
  try {
    const userId = req?.params?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const result = await userData.deleteUser(userId);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: `successfully deleted user : ${userId}`,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = req?.params?.page;
    if (!page) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const result = await userData.getAllUsers(page);
    if (!result || result.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'No Users To Show!',
      });
    }

    return res.status(200).json({
      success: true,
      message: `successfully loaded page ${page} users!`,
      body: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req?.params?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const result = await userData.getUser(userId);

    if (result) {
      return res.status(200).json({
        success: true,
        message: `successfully retrieved user : ${userId}`,
        body: result,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: `No users found with ${userId} id!`,
        body: result,
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

const suspendUser = async (req, res) => {
  try {
    const userId = req?.params?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const result = await userData.changeUserStatus(
      userId,
      accountStatus.SUSPENDED
    );
    if (result.affectedRows < 1) {
      return res.status(200).json({
        success: false,
        message: `No users found with ${userId} id!`,
        body: result,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `successfully suspended user : ${userId}`,
        body: result,
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

const activateUser = async (req, res) => {
  try {
    const userId = req?.params?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const result = await userData.changeUserStatus(
      userId,
      accountStatus.ACTIVE
    );
    if (result.affectedRows < 1) {
      return res.status(200).json({
        success: false,
        message: `No users found with ${userId} id`,
        body: result,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `successfully activated user : ${userId}`,
        body: result,
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

module.exports = {
  getAllUsers,
  getUser,
  suspendUser,
  removeUser,
  activateUser,
};
