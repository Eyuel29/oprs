require('dotenv').config();
const pool = require('../config/db');

const createUser = async (user) =>{
    const connection = await pool.getConnection();
    try {
    const {
        full_name,gender,phone_number,email,
        date_joined,zone,woreda,job_type,uploaded_file,
        age,account_status,region,married
    } = user;

        const [result] = await connection.execute(`INSERT INTO user(full_name,gender,phone_number,email,date_joined,zone,woreda,job_type,age,account_status,region,married) VALUES(?,?,?,?,?,?,?,?,?,?,?,?);`,
[full_name,gender,phone_number,email,date_joined,zone,woreda,job_type,age,account_status,region,married]);
        return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const addcontactInfo = async (user_id, contactInfo) => {
    const connection = await pool.getConnection();
    try {
      const placeholders = contactInfo.map(() => '(?, ?)').join(',');
      const values = contactInfo.reduce((acc, contact) => {
        acc.push(user_id, contact.full_name, contact.contact_address);
        return acc;
      }, []);
  
      const query = `INSERT INTO contact_info (user_id, full_name, contact_address) VALUES ${placeholders}`;
      const [rows] = await connection.execute(query, values);
      return rows;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
};
  
const createUserAuth = async (userId, authString, userRole) =>{
    const connection = await pool.getConnection();
    try {
            const [result] = await connection.
            execute('INSERT INTO user_auth(user_id, auth_string ,user_role) VALUES(?, ?, ?);',
            [userId, authString, userRole]);
            return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const registerUser  = async (userId, authString, userRole) =>{
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute('INSERT INTO user(user_id, full_name ,gender ,phone_number ,date_joined) VALUES(?, ?, ?, ?, ?);',
        [userId, authString, userRole]);
        return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const getUser = async (userId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`
        SELECT * FROM user INNER JOIN user_auth ON user.user_id = user_auth.user_id WHERE user.user_id = ?`, [userId]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getUserByEmail = async (email) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM user LEFT JOIN user_auth ON user.user_id = user_auth.user_id WHERE user.email = ?', [email]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getContactInfo = async (user_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM contact_info WHERE user_id = ?', [user_id]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getAllUsers = async (page) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM user INNER JOIN user_auth ON user.user_id = user_auth.user_id;');
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const updateUser = async (userId, userData) => {
    const connection = await pool.getConnection();
    try {
        const setClause = Object.keys(userData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(userData);
        values.push(userId);   
        const query = `UPDATE user SET ${setClause} WHERE user_id = ?;`;
        const [rows] = await connection.execute(query, values);
        return rows;
    } catch (err) {
        throw err;
    } finally {
        connection.release();
    }
}

const changeUserStatus = async (userId, status) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('UPDATE user SET account_status = ? WHERE user_id = ?;', [status ,userId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getUserStatus = async (userId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT account_status FROM user WHERE user_id = ?;', [userId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getUserInfo = async (userId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`SELECT user.*, user_photos.url,
            FROM user LEFT JOIN user_photos ON user.user_id = user_photos.user_id WHERE user.user_id = ? ;`, [userId]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const deleteUser = async (userId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('DELETE FROM user WHERE user_id = ?;', [userId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

module.exports = {
    createUser,
    createUserAuth,
    changeUserStatus,
    getUserStatus,
    getUser,
    getUserByEmail,
    getAllUsers,
    registerUser,
    updateUser,
    deleteUser,
    getUserInfo,
    addcontactInfo,getContactInfo
};
