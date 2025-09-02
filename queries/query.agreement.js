/* eslint-disable no-useless-catch */
require('dotenv').config();
const pool = require('../config/db.config');

const createAgreement = async (agreement, leaseDuration, checkInDate) => {
  const connection = await pool.getConnection();
  try {
    const { tenantId, ownerId, listingId } = agreement;
    const leaseStartDate = new Date(checkInDate).getTime();
    const leaseDurationMill = leaseDuration * 24 * 60 * 60 * 1000;
    const leaseEndDate = leaseStartDate + leaseDurationMill;
    const [result] = await connection.execute(
      `INSERT INTO agreement(
          tenantId,
          ownerId,
          listingId,
          leaseStartDate,
          leaseEndDate
        ) VALUES(?,?,?,?,?);`,
      [tenantId, ownerId, listingId, leaseStartDate, leaseEndDate]
    );

    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const extendAgreement = async (agreementId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `SELECT * FROM agreement WHERE agreementId = ?;`,
      [agreementId]
    );
    const agreement = result[0];

    const startDate = agreement.leaseStartDate;
    const endDate = agreement.leaseEndDate;
    const duration = endDate - startDate;

    const newEndDate = endDate + duration;

    const [updateResult] = await connection.execute(
      `UPDATE agreement SET leaseStartDate = ?, leaseEndDate = ?`,
      [endDate, newEndDate]
    );

    return updateResult;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getAgreements = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
              agreement.*,
              JSON_OBJECT(
                  "userId", tenant_user.userId,
                  "fullName", tenant_user.fullName,
                  "gender", tenant_user.gender,
                  "phoneNumber", tenant_user.phoneNumber,
                  "dateOfBirth", tenant_user.dateOfBirth,
                  "email", tenant_user.email,
                  "zone", tenant_user.zone,
                  "woreda", tenant_user.woreda,
                  "dateJoined", tenant_user.dateJoined,
                  "accountStatus", tenant_user.accountStatus,
                  "region", tenant_user.region,
                  "jobType", tenant_user.jobType,
                  "married", tenant_user.married,
                  "idPhotoUrl", tenant_user.idPhotoUrl,
                  "idType", tenant_user.idType,
                  "idNumber", tenant_user.idNumber,
                  "url", COALESCE(tenant_photos.url, '')
              ) AS tenant,
              listing.pricePerDuration AS pricePerDuration,
              listing.paymentCurrency AS paymentCurrency,
              paymentInfo.subaccountId AS subaccountId,
              JSON_OBJECT(
                  "userId", owner_user.userId,
                  "fullName", owner_user.fullName,
                  "gender", owner_user.gender,
                  "phoneNumber", owner_user.phoneNumber,
                  "dateOfBirth", owner_user.dateOfBirth,
                  "email", owner_user.email,
                  "zone", owner_user.zone,
                  "woreda", owner_user.woreda,
                  "dateJoined", owner_user.dateJoined,
                  "accountStatus", owner_user.accountStatus,
                  "region", owner_user.region,
                  "jobType", owner_user.jobType,
                  "married", owner_user.married,
                  "idPhotoUrl", tenant_user.idPhotoUrl,
                  "idType", tenant_user.idType,
                  "idNumber", tenant_user.idNumber,
                  "url", COALESCE(owner_photos.url, '')
              ) AS owner
          FROM agreement
          LEFT JOIN user AS tenant_user ON agreement.tenantId = tenant_user.userId
          LEFT JOIN userPhotos AS tenant_photos ON tenant_user.userId = tenant_photos.userId
          LEFT JOIN user AS owner_user ON agreement.ownerId = owner_user.userId
          LEFT JOIN userPhotos AS owner_photos ON owner_user.userId = owner_photos.userId
          LEFT JOIN listing ON listing.listingId = agreement.listingId
          LEFT JOIN paymentInfo ON owner_user.userId = paymentInfo.userId
          WHERE agreement.ownerId = ? OR agreement.tenantId = ?;`,
      [userId, userId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const cancelAgreements = async (tenantId, _) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'DELETE FROM agreement WHERE tenantId = ?;',
      [tenantId]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  cancelAgreements,
  createAgreement,
  extendAgreement,
  getAgreements,
};
