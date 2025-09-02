/* eslint-disable no-useless-catch */
require('dotenv').config();
const pool = require('../config/db.config');

const createUser = async (user, contactInfo, photoUrl) => {
  const connection = await pool.getConnection();
  connection.beginTransaction();
  try {
    const {
      fullName,
      gender,
      phoneNumber,
      email,
      zone,
      woreda,
      jobType,
      idType,
      idNumber,
      idPhotoUrl,
      dateOfBirth,
      married,
      accountStatus,
      region,
      role,
      citizenship,
    } = user;

    const [result] = await connection.execute(
      `INSERT INTO user(
            fullName,
            gender,
            phoneNumber,
            email,
            zone,
            woreda,
            jobType,
            idType,
            idNumber,
            idPhotoUrl,
            dateOfBirth,
            accountStatus,
            region,
            married,
            role,
            citizenship	) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
      [
        fullName,
        gender,
        phoneNumber,
        email,
        zone,
        woreda,
        jobType,
        idType,
        idNumber,
        idPhotoUrl,
        dateOfBirth,
        accountStatus,
        region,
        married,
        role,
        citizenship,
      ]
    );

    const placeholders = contactInfo.map(() => '(?, ?)').join(',');
    const values = contactInfo.reduce((acc, contact) => {
      acc.push(userId, contact.fullName, contact.contactAddress);
      return acc;
    }, []);

    if (contactInfo && contactInfo.length > 0) {
      await connection.execute(
        `INSERT INTO contactInfo (userId, contactName, contactAddress) VALUES ${placeholders}`,
        [values]
      );
    }

    if (photoUrl) {
      await connection.execute(
        `INSERT INTO userPhotos (userId, url) VALUES(?,?);`,
        [result.insertId, photoUrl]
      );
    }

    connection.commit();
    return result;
  } catch (error) {
    connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const addcontactInfo = async (userId, contactInfo) => {
  const connection = await pool.getConnection();
  try {
    const placeholders = contactInfo.map(() => '(?, ?)').join(',');
    const values = contactInfo.reduce((acc, contact) => {
      acc.push(userId, contact.fullName, contact.contactAddress);
      return acc;
    }, []);

    const query = `INSERT INTO contactInfo (userId, contactName, contactAddress) VALUES ${placeholders}`;
    const [rows] = await connection.execute(query, values);

    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const createUserAuth = async (userId, authString) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO userAuth(userId, authString) VALUES(?, ?);',
      [userId, authString]
    );
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getUser = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
        user.*,
        COALESCE(( 
            SELECT userPhotos.url 
            FROM userPhotos 
            WHERE user.userId = userPhotos.userId 
            LIMIT 1 
        ),'') AS photo_url,
        COALESCE(
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'contactName', contactInfo.contactName, 
                    'contactAddress', contactInfo.contactAddress
                )
            ), JSON_ARRAY()
        ) AS contactInfos 
        FROM user LEFT JOIN contactInfo ON user.userId = contactInfo.userId 
        WHERE user.userId = ? GROUP BY user.userId;`,
      [userId]
    );
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getUserByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
        user.*,
        COALESCE(
        (SELECT userAuth.authString 
            FROM userAuth 
            WHERE user.userId = userAuth.userId 
            LIMIT 1), 
        '') AS authString,
        COALESCE(
        (SELECT userPhotos.url 
            FROM userPhotos 
            WHERE user.userId = userPhotos.userId 
            LIMIT 1), 
        '') AS photo_url,
        COALESCE(
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'contactName', contactInfo.contactName, 
                'contactAddress', contactInfo.contactAddress
            )), JSON_ARRAY()) AS contactInfos 
        FROM user LEFT JOIN contactInfo ON user.userId = contactInfo.userId 
        WHERE user.email = ? GROUP BY user.userId;`,
      [email]
    );
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getAllUsers = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(`SELECT 
    user.*,
    COALESCE((SELECT userPhotos.url 
        FROM userPhotos 
        WHERE user.userId = userPhotos.userId 
        LIMIT 1), '') AS photo_url,
    COALESCE(
        JSON_ARRAYAGG(
            JSON_OBJECT('contactName', contactInfo.contactName, 'contactAddress', contactInfo.contactAddress)
        ), JSON_ARRAY()) AS contactInfos FROM user 
    LEFT JOIN contactInfo ON user.userId = contactInfo.userId GROUP BY user.userId;`);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const updateUser = async (userId, userData, photoUrl) => {
  const connection = await pool.getConnection();
  try {
    const setClause = Object.keys(userData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(userData);
    values.push(userId);
    const query = `UPDATE user SET ${setClause} WHERE userId = ?;`;
    console.log(values);

    const [rows] = await connection.execute(query, values);
    if (photoUrl) {
      await connection.execute(
        `UPDATE userPhotos SET url = ? WHERE userId = ?;`,
        [photoUrl, userId]
      );
    }
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const changeUserStatus = async (userId, status) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `UPDATE user SET accountStatus = ? WHERE userId = ?;`,
      [status, userId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const changeUserAuthString = async (userId, authString) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `UPDATE userAuth SET authString = ? WHERE userId = ?;`,
      [authString, userId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getUserStatus = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT accountStatus FROM user WHERE userId = ?;',
      [userId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const deleteUser = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'DELETE FROM user WHERE userId = ?;',
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
  createUser,
  createUserAuth,
  changeUserStatus,
  getUserStatus,
  getUser,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
  changeUserAuthString,
  addcontactInfo,
};
