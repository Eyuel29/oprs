require('dotenv').config();
const pool = require('../config/db');

const createRequest = async (reservation) =>{
const connection = await pool.getConnection();
   connection.beginTransaction();
  try {
      const {tenant_id,owner_id,tenant_name,listing_id,selected_payment_method,date,price_offer, stay_dates}  = reservation;
        const [result] = await connection.
        execute(`INSERT INTO reservation(tenant_id,owner_id,tenant_name,listing_id,selected_payment_method,date,price_offer) 
        VALUES(?,?,?,?,?,?,?);`,[tenant_id,owner_id,tenant_name,listing_id,selected_payment_method,date,price_offer]);

        const placeholders = stay_dates.map(() => '(?, ?)').join(',');
        const values = []; 
        Object.values(stay_dates).map((v, i) => {
            values.push(result.insertId);
            values.push(v);
        });
        const query = `INSERT INTO stay_dates (reservation_id,stay_date) VALUES ${placeholders}`;
        await connection.execute(query, values);
        

        connection.commit();
        return result;
    } catch (error) {
        connection.rollback()
        throw error;
    }finally{
        connection.release();
    }
}

const getReservations = async (owner_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            `SELECT 
                reservation.*,
                (SELECT JSON_ARRAYAGG(stay_dates.stay_date) 
                 FROM stay_dates 
                 WHERE stay_dates.reservation_id = reservation.reservation_id) AS stay_dates 
            FROM reservation WHERE owner_id = ? AND status = 2000;`,
             [owner_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getReservation = async (owner_id, reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`SELECT 
                reservation.*,
                (SELECT JSON_ARRAYAGG(stay_dates.stay_date) 
                 FROM stay_dates 
                 WHERE stay_dates.reservation_id = reservation.reservation_id) AS stay_dates 
            FROM reservation WHERE owner_id = ? AND reservation_id = ?;`, [owner_id, reservation_id]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getRequest = async (tenant_id, reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`SELECT 
                reservation.*,
                (SELECT JSON_ARRAYAGG(stay_dates.stay_date) 
                 FROM stay_dates 
                 WHERE stay_dates.reservation_id = reservation.reservation_id) AS stay_dates 
            FROM reservation WHERE tenant_id = ? AND reservation_id = ?;`, [tenant_id, reservation_id]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}


const getRequests = async (tenant_id) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
        `SELECT reservation.*, (SELECT JSON_ARRAYAGG(stay_dates.stay_date) FROM stay_dates WHERE 
        stay_dates.reservation_id = reservation.reservation_id) AS stay_dates FROM reservation 
        WHERE tenant_id = ?;`,[tenant_id]);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        connection.release();
    }
}

const appoveReservation = async (owner_id,reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
        'UPDATE reservation SET status = 3000 WHERE reservation.reservation_id = ? AND reservation.owner_id = ?;',
        [reservation_id, owner_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const declineReservation = async (owner_id,reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('UPDATE reservation SET status = 1000 WHERE reservation.reservation_id = ? AND reservation.owner_id = ?;', [reservation_id, owner_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const cancelReservation = async (tenant_id, reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('DELETE FROM reservation WHERE tenant_id = ? AND reservation_id = ?;', [tenant_id, reservation_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

module.exports = {
    createRequest,
    getRequests,
    getRequest,
    appoveReservation,
    declineReservation,
    cancelReservation,
    getReservations,
    getReservation,
};
