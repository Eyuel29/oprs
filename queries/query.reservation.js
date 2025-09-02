/* eslint-disable no-useless-catch */
require('dotenv').config();
const pool = require('../config/db.config');

const createRequest = async (reservation) => {
  const connection = await pool.getConnection();
  connection.beginTransaction();
  try {
    const {
      tenantId,
      ownerId,
      additionalMessage,
      listingId,
      selectedPaymentMethod,
      priceOffer,
      stayDates,
    } = reservation;
    const [result] = await connection.execute(
      `INSERT INTO reservation(tenantId,ownerId,additionalMessage,listingId,selectedPaymentMethod,priceOffer) 
        VALUES(?,?,?,?,?,?);`,
      [
        tenantId,
        ownerId,
        additionalMessage,
        listingId,
        selectedPaymentMethod,
        priceOffer,
      ]
    );

    const placeholders = stayDates.map(() => '(?, ?)').join(',');
    const values = [];
    Object.values(stayDates).map((v, i) => {
      values.push(result.insertId);
      values.push(v);
    });
    const query = `INSERT INTO stayDates (reservationId,stayDate) VALUES ${placeholders}`;
    await connection.execute(query, values);

    connection.commit();
    return result;
  } catch (error) {
    connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getReservations = async (ownerId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
                reservation.*,
                listing.title as listing_title,
                listing.description as description,
                listing.leaseDurationDays as leaseDurationDays,
                JSON_OBJECT(
                    "userId", user.userId,
                    "fullName", user.fullName,
                    "gender", user.gender,
                    "phoneNumber", user.phoneNumber,
                    "dateOfBirth", user.dateOfBirth,
                    "email", user.email,
                    "zone", user.zone,
                    "woreda", user.woreda,
                    "dateJoined", user.dateJoined,
                    "accountStatus", user.accountStatus,
                    "region", user.region,
                    "jobType", user.jobType,
                    "married", user.married,
                    "idPhotoUrl", user.idPhotoUrl,
                    "idNumber", user.idNumber,
                    "idType", user.idType
                ) AS tenant,
                (SELECT JSON_ARRAYAGG(stayDates.stayDate)
                 FROM stayDates 
                 WHERE stayDates.reservationId = reservation.reservationId) AS stayDates 
            FROM reservation 
            LEFT JOIN user ON user.userId = reservation.tenantId 
            LEFT JOIN listing ON reservation.listingId = listing.listingId 
            WHERE ( reservation.ownerId = ? OR reservation.tenantId = ? ) AND reservation.status = 'inactive';`,
      [ownerId, ownerId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getReservationsReports = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
                reservation.*,
                listing.title as listing_title,
                listing.description as description,
                listing.leaseDurationDays as leaseDurationDays,
                JSON_OBJECT(
                    "userId", user.userId,
                    "fullName", user.fullName,
                    "gender", user.gender,
                    "phoneNumber", user.phoneNumber,
                    "dateOfBirth", user.dateOfBirth,
                    "email", user.email,
                    "zone", user.zone,
                    "woreda", user.woreda,
                    "dateJoined", user.dateJoined,
                    "accountStatus", user.accountStatus,
                    "region", user.region,
                    "jobType", user.jobType,
                    "married", user.married,
                    "idPhotoUrl", user.idPhotoUrl,
                    "idNumber", user.idNumber,
                    "idType", user.idType
                ) AS tenant,
                (SELECT JSON_ARRAYAGG(stayDates.stayDate)
                 FROM stayDates 
                 WHERE stayDates.reservationId = reservation.reservationId) AS stayDates 
            FROM reservation 
            LEFT JOIN user ON user.userId = reservation.tenantId 
            LEFT JOIN listing ON reservation.listingId = listing.listingId;`
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getReservation = async (ownerId, reservationId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
                reservation.*,
                listing.title as listing_title,
                listing.description as description,
                listing.leaseDurationDays as leaseDurationDays,
                JSON_OBJECT(
                    "userId", user.userId,
                    "fullName", user.fullName,
                    "gender", user.gender,
                    "phoneNumber", user.phoneNumber,
                    "dateOfBirth", user.dateOfBirth,
                    "email", user.email,
                    "zone", user.zone,
                    "woreda", user.woreda,
                    "dateJoined", user.dateJoined,
                    "accountStatus", user.accountStatus,
                    "region", user.region,
                    "jobType", user.jobType,
                    "married", user.married,
                    "idPhotoUrl", user.idPhotoUrl,
                    "idNumber", user.idNumber,
                    "idType", user.idType
                ) AS tenant,
                (SELECT JSON_ARRAYAGG(stayDates.stayDate)
                 FROM stayDates 
                 WHERE stayDates.reservationId = reservation.reservationId) AS stayDates 
            FROM reservation 
            LEFT JOIN user ON user.userId = reservation.tenantId 
            LEFT JOIN listing ON reservation.listingId = listing.listingId 
            WHERE reservation.ownerId = ? AND reservation.reservationId = ?;`,
      [ownerId, reservationId]
    );
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getRequest = async (tenantId, reservationId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
            reservation.*,
            (SELECT JSON_ARRAYAGG(stayDates.stayDate) 
                FROM stayDates 
                WHERE stayDates.reservationId = reservation.reservationId) AS stayDates 
            FROM reservation WHERE tenantId = ? AND reservationId = ?;`,
      [tenantId, reservationId]
    );
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getRequests = async (tenantId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT reservation.*, (SELECT JSON_ARRAYAGG(stayDates.stayDate) FROM stayDates WHERE 
        stayDates.reservationId = reservation.reservationId) AS stayDates FROM reservation 
        WHERE tenantId = ?;`,
      [tenantId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const appoveReservation = async (ownerId, reservationId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `UPDATE reservation SET status = 'accepted' WHERE reservation.reservationId = ? AND reservation.ownerId = ?;`,
      [reservationId, ownerId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const declineReservation = async (ownerId, reservationId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `UPDATE reservation SET status = 'rejected' WHERE reservation.reservationId = ? AND reservation.ownerId = ?;`,
      [reservationId, ownerId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const cancelReservation = async (tenantId, reservationId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'DELETE FROM reservation WHERE tenantId = ? AND reservationId = ?;',
      [tenantId, reservationId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequest,
  appoveReservation,
  declineReservation,
  cancelReservation,
  getReservations,
  getReservation,
  getReservationsReports,
};
