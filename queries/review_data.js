require('dotenv').config();
const pool = require('../config/db');

const createReview = async (review) => {
  const connection = await pool.getConnection();
  try {
    const {
      authorId,
      reviewMessage,
      reviewedListingId,
      authorName,
      rating,
      receiverId,
    } = review;
    const [result] = await connection.execute(
      `INSERT INTO reviews(authorId,reviewedListingId,receiverId,reviewMessage,rating,authorName)
    VALUES(?,?,?,?,?,?);`,
      [
        authorId,
        reviewedListingId ?? 0,
        receiverId,
        reviewMessage,
        rating,
        authorName,
      ]
    );
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const deleteReview = async (userId, reviewId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `DELETE FROM reviews WHERE authorId = ? AND reviewId = ?;`,
      [userId, reviewId]
    );
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getListingReviews = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM reviews WHERE reviewedListingId = ?;',
      [listingId]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getUserReviews = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
    reviews.*,
    user.fullName,
    COALESCE(
        (SELECT userPhotos.url 
         FROM userPhotos 
         WHERE reviews.authorId = userPhotos.userId 
         LIMIT 1), 
        '') AS photo_url FROM 
    reviews LEFT JOIN 
    user ON reviews.authorId = user.userId WHERE 
    reviews.receiverId = ? GROUP BY reviews.reviewId;`,
      [userId]
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createReview,
  deleteReview,
  getListingReviews,
  getUserReviews,
};
