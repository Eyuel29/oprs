require('dotenv').config();
const pool = require('../config/db');

const createNotification = async (initiator_id,receiver_id,type,title,body,date) =>{
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute('INSERT INTO notification(initiator_id,receiver_id,type,title,body,date)VALUES(?,?,?,?,?,?)', [initiator_id,receiver_id,type,title,body,date]);
        return result;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    } 
}

const getNotifications = async (user_id) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`SELECT * FROM notification WHERE receiver_id = ?;`,
        [user_id]);
        await connection.execute(`UPDATE notification SET viewed = TRUE WHERE receiver_id = ?;`,[user_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }  
}

const getNotificationCount = async (user_id) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`SELECT COUNT(*) AS unseen_count FROM notification WHERE viewed = 0 AND receiver_id = ?;`,[user_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }  
}

module.exports = {
 createNotification,
 getNotificationCount,
 getNotifications,   
}