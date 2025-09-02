require('dotenv').config();
const pool = require('../config/db.config');

const createNotification = async (
  initiatorId,
  receiverId,
  type,
  title,
  body
) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO notification(initiatorId,receiverId,type,title,body)VALUES(?,?,?,?,?)`,
      [initiatorId, receiverId, type, title, body]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getNotifications = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
    notification.*, 
    JSON_OBJECT(
        'userId', user.userId,
        'fullName', user.fullName,
        'gender', user.gender,
        'phoneNumber', user.phoneNumber,
        'dateOfBirth', user.dateOfBirth,
        'email', user.email,
        'zone', user.zone,
        'woreda', user.woreda,
        'dateJoined', user.dateJoined,
        'accountStatus', user.accountStatus,
        'region', user.region,
        'jobType', user.jobType,
        'married', user.married,
        "idPhotoUrl", user.idPhotoUrl,
        "idType", user.idType,
        "idNumber", user.idNumber,
        'photo_url', COALESCE(
            (SELECT userPhotos.url 
             FROM userPhotos 
             WHERE user.userId = userPhotos.userId 
             LIMIT 1), 
            JSON_ARRAY()
        ),
        'contactInfos', COALESCE(
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'contactName', contactInfo.contactName, 
                    'contactAddress', contactInfo.contactAddress
                )
            ), 
            JSON_ARRAY()
        )
    ) AS initiator FROM notification 
    LEFT JOIN user ON notification.initiatorId = user.userId 
    LEFT JOIN contactInfo ON user.userId = contactInfo.userId 
    WHERE notification.receiverId = ? GROUP BY notification.notificationId, user.userId;`,
      [userId]
    );

    await connection.execute(
      `UPDATE notification SET viewed = TRUE WHERE receiverId = ?;`,
      [userId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getNotificationCount = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `
            SELECT COUNT(*) AS unseen_count FROM notification 
            WHERE viewed = 0 AND receiverId = ?;`,
      [userId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  createNotification,
  getNotificationCount,
  getNotifications,
};
