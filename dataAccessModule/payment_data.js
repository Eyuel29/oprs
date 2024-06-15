require('dotenv').config();
const pool = require('../config/db');

const createSubAccount = async (user_id,account_number,sub_account_id,business_name,account_owner_name,bank_id,bank_name) =>{
    const connection = await pool.getConnection();
    try {
    const [result] = await connection.execute(
    `INSERT INTO payment_info(user_id,account_number,sub_account_id,business_name,account_owner_name,bank_id,bank_name) 
    VALUES(?,?,?,?,?,?,?);`,[user_id,account_number,sub_account_id,business_name,account_owner_name,bank_id,bank_name]);
    return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const getPaymentInfo  = async (user_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM payment_info WHERE user_id = ?;', [user_id]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const deleteSubAccount = async (user_id) =>{
    const connection = await pool.getConnection();
    try {
       const [result] = await connection.execute(
      `DELETE FROM payment_info WHERE user_id = ?;`, [user_id]);
       return result;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

module.exports = {
    createSubAccount,
    deleteSubAccount,
    getPaymentInfo,
};
