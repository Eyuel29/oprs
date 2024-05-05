require('dotenv').config();
const pool = require('../config/db');

const createRequest = async (reservation) =>{
  try {
    const {reservation_id,tenant_id,listing_id,selected_payment_method,date,price_offer}  = reservation;
    const connection = await pool.getConnection();
        const [result] = await connection.
        execute(`INSERT INTO reservation(reservation_id,tenant_id,listing_id,selected_payment_method,date,price_offer) 
        VALUES(?,?,?,?,?,?);`,[reservation_id,tenant_id,listing_id,selected_payment_method,date,price_offer]);
        return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const getRequests = async (owner_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM reservation INNER JOIN stay_dates ON reservation.reservation_id = stay_dates.reservation_id WHERE owner_id = ?;', [owner_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getRequest = async (owner_id, reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM reservation INNER JOIN stay_dates ON reservation.reservation_id = stay_dates.reservation_id WHERE owner_id = ? AND reservation_id = ?;', [owner_id, reservation_id]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const appoveReservation = async (owner_id,reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('UPDATE reservation SET status = 3000 WHERE reservation_id = ? AND owner_id = ?;', [reservation_id, owner_id]);
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
        const [rows] = await connection.execute('UPDATE reservation SET status = 1000 WHERE reservation_id = ? AND owner_id = ?;', [reservation_id, owner_id]);
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
    appoveReservation,
    declineReservation,
    cancelReservation,
    getRequest
};
