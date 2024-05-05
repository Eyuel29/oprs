require('dotenv').config();
const pool = require('../config/db');

const createReview = async (review) =>{
  try {
    const {review_id,author_id,review_date,review_message,rating,listing_id,receiver_id} = review;
    const connection = await pool.getConnection();
        const [result] = await connection.
        execute(`INSERT INTO reviews(review_id,author_id,review_date,review_message,rating,listing_id,receiver_id) 
        VALUES(?,?,?,?,?,?,?);`,[review_id,author_id,review_date,review_message,rating,listing_id,receiver_id]);
        return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const deleteReview = async (review_id) =>{
    try {
      const connection = await pool.getConnection();
          const [result] = await connection.
          execute(`DELETE FROM reviews WHERE review_id = ?;`,[review_id]);
          return result;
      } catch (error) {
          throw error;
      }finally{
          connection.release();
      }
}

const getListingReviews  = async (listing_id) =>{
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.
        execute('SELECT * FROM reviews WHERE listing_id = ?;',
        [listing_id]);
        return rows;
    } catch (error) {
        throw error;
    }finally{
            connection.release();
    }
}

const getUserReviews  = async (user_id) =>{
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.
        execute('SELECT * FROM reviews WHERE receiver_id = ?;',
        [user_id]);
        return rows;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

module.exports = {
    createReview,
    deleteReview,
    getListingReviews,
    getUserReviews
};
