require('dotenv').config();
const pool = require('../config/db');

const createUser = async (user) =>{
  try {
    const connection = await pool.getConnection();
        const [result] = await connection.
        execute('INSERT INTO user(user_id,full_name,gender,phone_number,email,date_joined,zone,woreda,job_type,photo_url,age,STATUS,region,married) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?);',user);
        return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const createUserAuth = async (userId, authString, userRole) =>{
    try {
        const connection = await pool.getConnection();
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
    try {
        const connection = await pool.getConnection();
            const [result] = await connection.
            execute('INSERT INTO user(user_id, full_name ,gender ,phone_number ,date_joined) VALUES(?, ?, ?, ?, ?);',
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
        const [rows] = await connection.execute('SELECT * FROM user INNER JOIN user_auth ON user.user_id = user_auth.user_id WHERE users.user_id = ?', [userId]);
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
        const [rows] = await connection.execute('SELECT * FROM user INNER JOIN user_auth ON user.user_id = user_auth.user_id WHERE email = ?', [email]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getPageUser = async (page) =>{
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

const updateUser = async (userId, attrName, attrVal) =>{

    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('UPDATE user SET ? = ? WHERE user_id = ?;', [attrName, attrVal, userId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const changeUserStatus = async (userId, status) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('UPDATE user SET STATUS = ? WHERE user_id = ?;', [status ,userId]);
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
        const [rows] = await connection.execute('SELECT STATUS FROM user WHERE user_id = ?;', [userId]);
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
        const [rows] = await connection.execute('SELECT * FROM user WHERE user_id = ?;', [userId]);
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
    getPageUser,
    registerUser,
    updateUser,
    deleteUser,
    getUserInfo
};
