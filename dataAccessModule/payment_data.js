require('dotenv').config();
const pool = require('../config/db');

const deleteSubAccount = async (sub_account_id) =>{
    try {
        const [rows] = await connection.execute('DELETE FROM payment_info WHERE sub_account_id = ?;', [sub_account_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const createSubAccount = async (user_id,account_number,sub_account_id,business_name,account_owner_name,bank_id,bank_name) =>{
    try {
      const connection = await pool.getConnection();
          const [result] = await connection.
          execute('INSERT INTO payment_info(user_id,account_number,sub_account_id,business_name,account_owner_name,bank_id,bank_name) VALUES(?,?,?,?,?,?,?);',[user_id,account_number,sub_account_id,business_name,account_owner_name,bank_id,bank_name]);
          return result;
      } catch (error) {
          throw error;
      }finally{
          connection.release();
      }
}

const getBills  = async (agreement_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM agreements WHERE agreement_id = ? AND lease_end_date < ?;', [agreement_id, Date.now()]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const createPaymentReference = async (data) =>{
    const {receiver_id,payee_id,first_name,last_name,email,currency,amount,charge,mode,method,type,status,reference,tx_ref,title,description,created_at,updated_at} = data;
    try {
      const connection = await pool.getConnection();
          const [result] = await connection.
          execute('INSERT INTO payment_reference(first_name,last_name,email,currency,amount,charge,mode,method,type,status,reference,tx_ref,title,description,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',[first_name,last_name,email,currency,amount,charge,mode,method,type,status,reference,tx_ref,title,description,created_at,updated_at]);

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
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

module.exports = {
    getBills,
    createSubAccount,
    deleteSubAccount,
    getPaymentInfo,
    createPaymentReference
};
