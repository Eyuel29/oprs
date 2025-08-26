const pool = require('../config/db');
require('dotenv').config();

const createVerificationKey = async (userId, key, createdAt, expiresAt) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'INSERT INTO verificationKeys(userId, verificationKey, createdAt, expiresAt)VALUES(?,?,?,?);',
      [userId, key, createdAt, expiresAt]
    );
    connection.release();
    return rows;
  } catch (err) {
    throw err;
  }
};

const getVerificationKey = async (key) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM verificationKeys WHERE verificationKey = ?;',
      [key]
    );
    connection.release();
    return rows;
  } catch (err) {
    throw err;
  }
};

const deleteVerificationKey = async (key) => {
  const connection = await pool.getConnection();
  try {
    const [res] = await connection.execute(
      'DELETE FROM verificationKeys WHERE verificationKey = ?;',
      [key]
    );
    connection.release();
    return res;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createVerificationKey,
  getVerificationKey,
  deleteVerificationKey,
};
