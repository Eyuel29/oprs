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

const createPaymentReference = async (tenant_id, owner_id, tReference) => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `INSERT INTO payment_reference (tenant_id, owner_id, tx_ref) VALUES (?, ?, ?);`,
            [tenant_id, owner_id, tReference]
        );
        return result;
    } catch (error) {
        console.error("Error creating payment reference:", error);
        throw error;
    } finally {
        connection.release();
    }
}

const getPaymentReference = async (tReference) => {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(`
            SELECT payment_reference.*,
            JSON_OBJECT(
                    "user_id", user.user_id,
                    "full_name", user.full_name,
                    "gender", user.gender,
                    "phone_number", user.phone_number,
                    "age", user.age,
                    "email", user.email,
                    "zone", user.zone,
                    "woreda", user.woreda,
                    "date_joined", user.date_joined,
                    "account_status", user.account_status,
                    "region", user.region,
                    "job_type", user.job_type,
                    "married", user.married
                ) AS tenant
             FROM payment_reference
             LEFT JOIN user ON user.user_id = payment_reference.tenant_id 
             WHERE payment_reference.tx_ref = ?
            `,[tReference]);
        return result[0];
    } catch (error) {
        console.error("Error creating payment reference:", error);
        throw error;
    } finally {
        connection.release();
    }
}

const verifyPaymentReference = async (paymentReference) => {
    const connection = await pool.getConnection();
    try {
        const {
            first_name,last_name,
            email,currency,amount,
            charge,mode,method,type,
            status,reference,tReference,
        } = paymentReference;

        const [result] = await connection.execute(
            `UPDATE payment_reference SET 
            first_name = ?, last_name = ?, email = ?, currency = ?, amount = ?, charge = ?, mode = ?, 
            method = ?, type = ?, status = ?, reference = ? WHERE tx_ref = ?;`,
            [   
                first_name,
                last_name,
                email,
                currency,
                amount,
                charge,
                mode,
                method,
                type,
                status,
                reference,
                tReference
            ]
        );
        return result;
    } catch (error) {
        console.error("Error updating payment reference:", error);
        throw error;
    } finally {
        connection.release();
    }
}


module.exports = {
    createPaymentReference,
    verifyPaymentReference,
    createSubAccount,
    deleteSubAccount,
    getPaymentInfo,
    getPaymentReference
};
