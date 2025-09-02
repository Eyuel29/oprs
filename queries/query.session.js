require('dotenv').config();
const pool = require('../config/db.config');

const createUserSession = async (
  sessionId,
  userId,
  role,
  userAgent,
  origin,
  createdAt,
  expiresAt
) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'INSERT INTO session(sessionId,userId,role,userAgent,userIp,createdAt,expiresAt)VALUES(?,?,?,?,?,?,?);',
      [sessionId, userId, role, userAgent, origin, createdAt, expiresAt]
    );
    connection.release();
    return rows;
  } catch (err) {
    throw err;
  }
};

const getUserSession = async (sessionId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM session WHERE sessionId = ?;',
      [sessionId]
    );
    connection.release();
    return rows;
  } catch (err) {
    throw err;
  }
};

const getUserSessionByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [[userId]] = await connection.execute(
      'SELECT userId FROM users WHERE email = ?;',
      [email]
    );
    const [rows] = await connection.execute(
      'SELECT * FROM session WHERE userId = ?;',
      [userId.userId]
    );
    connection.release();
    return rows;
  } catch (err) {
    throw err;
  }
};

const deleteUserSession = async (sessionId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'DELETE FROM session WHERE sessionId = ?;',
      [sessionId]
    );
    connection.release();
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  deleteUserSession,
  createUserSession,
  getUserSession,
  getUserSessionByEmail,
};
