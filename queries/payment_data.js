/* eslint-disable no-useless-catch */
require('dotenv').config();
const pool = require('../config/db');

const createSubAccount = async (
  userId,
  accountNumber,
  subaccountId,
  businessName,
  accountOwnerName,
  bankId,
  bankName
) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO paymentInfo(userId,accountNumber,subaccountId,businessName,accountOwnerName,bankId,bankName) 
    VALUES(?,?,?,?,?,?,?);`,
      [
        userId,
        accountNumber,
        subaccountId,
        businessName,
        accountOwnerName,
        bankId,
        bankName,
      ]
    );
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getPaymentInfo = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM paymentInfo WHERE userId = ?;',
      [userId]
    );
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const deleteSubAccount = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `DELETE FROM paymentInfo WHERE userId = ?;`,
      [userId]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const createPaymentReference = async (tenantId, ownerId, tReference) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO paymentreference (tenantId, ownerId, txref) VALUES (?, ?, ?);`,
      [tenantId, ownerId, tReference]
    );
    return result;
  } catch (error) {
    console.error('Error creating payment reference:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const getPaymentReference = async (tReference) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `
            SELECT * FROM paymentreference WHERE paymentreference.txref = ?`,
      [tReference]
    );
    return result[0];
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getAllPaymentReferences = async () => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `SELECT * FROM paymentreference;`
    );
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const verifyPaymentReference = async (paymentReference) => {
  const connection = await pool.getConnection();
  try {
    const {
      firstName,
      lastName,
      email,
      currency,
      amount,
      charge,
      mode,
      method,
      type,
      status,
      reference,
      tReference,
    } = paymentReference;

    const [result] = await connection.execute(
      `UPDATE paymentreference SET 
            firstName = ?, lastName = ?, email = ?, currency = ?, amount = ?, charge = ?, mode = ?, 
            method = ?, type = ?, status = ?, reference = ? WHERE txref = ?;`,
      [
        firstName,
        lastName,
        email,
        currency,
        amount,
        charge,
        mode,
        method,
        type,
        status,
        reference,
        tReference,
      ]
    );
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createPaymentReference,
  verifyPaymentReference,
  createSubAccount,
  deleteSubAccount,
  getPaymentInfo,
  getPaymentReference,
  getAllPaymentReferences,
};
