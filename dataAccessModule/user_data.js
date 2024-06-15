require('dotenv').config();
const pool = require('../config/db');

const createUser = async (user,contactInfo,photoUrl) =>{
    const connection = await pool.getConnection();
    connection.beginTransaction();
    try {
    const {
        full_name,gender,phone_number,email,
        zone,woreda,job_type,age,married,
        account_status,region,user_role} = user;


        // console.log(full_name,gender,phone_number,email,zone,woreda,job_type,age,account_status,region,married,user_role);

        const [result] = await connection.execute(
            `INSERT INTO user(full_name,gender,phone_number,email,zone,woreda,job_type,age,account_status,region,married,user_role) VALUES(?,?,?,?,?,?,?,?,?,?,?,?);`,
        [full_name,gender,phone_number,email,zone,woreda,job_type,age,account_status,region,married,user_role]);

        const placeholders = contactInfo.map(() => '(?, ?)').join(',');
        const values = contactInfo.reduce((acc, contact) => {
            acc.push(user_id, contact.full_name, contact.contact_address);
            return acc;
        }, []);
    
        if (contactInfo && contactInfo.length > 0) {
            await connection.execute(`INSERT INTO contact_info (user_id, contact_name, contact_address) VALUES ${placeholders}`, [values]);   
        }

        if (photoUrl) {
            await connection.execute(`INSERT INTO user_photos (user_id, url) VALUES(?,?);`,[result.insertId, photoUrl]);
        }
        
        connection.commit();
        return result;
    } catch (error) {
        connection.rollback();
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
  
      const query = `INSERT INTO contact_info (user_id, contact_name, contact_address) VALUES ${placeholders}`;
      const [rows] = await connection.execute(query, values);
      return rows;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
};
  
const createUserAuth = async (userId, authString) =>{
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.
        execute('INSERT INTO user_auth(user_id, auth_string) VALUES(?, ?);',
        [userId, authString]);
        return result;
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
}

const registerUser  = async (userId, authString) =>{
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute('INSERT INTO user(user_id, user_auth) VALUES(?, ?);',
        [userId, authString]);
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
        const [rows] = await connection.execute(`SELECT user.*,
    user_photos.url as photo_url,COALESCE(
    JSON_ARRAYAGG(JSON_OBJECT('contact_name', contact_info.contact_name, 'contact_address', contact_info.contact_address)),
    JSON_ARRAY()) AS contact_infos FROM user LEFT JOIN user_photos ON user.user_id = user_photos.user_id LEFT JOIN 
    contact_info ON user.user_id = contact_info.user_id WHERE user.user_id = ? GROUP BY user.user_id;`, [userId]);
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
        const [rows] = await connection.execute(`
    SELECT user.*,
    user_photos.url as photo_url,
    user_auth.auth_string as auth_string,
    COALESCE(JSON_ARRAYAGG(JSON_OBJECT('contact_name', contact_info.contact_name, 'contact_address', contact_info.contact_address) ),
    JSON_ARRAY()) AS contact_infos FROM user LEFT JOIN user_photos ON user.user_id = user_photos.user_id LEFT JOIN 
    contact_info ON user.user_id = contact_info.user_id LEFT JOIN user_auth ON user.user_id = user_auth.user_id WHERE user.email = ? GROUP BY user.user_id;`, 
            [email]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const getAllUsers = async () =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`SELECT user.*,
        user_photos.url as photo_url,COALESCE(
        JSON_ARRAYAGG(JSON_OBJECT('contact_name', contact_info.contact_name, 'contact_address', contact_info.contact_address)),
        JSON_ARRAY()) AS contact_infos FROM user LEFT JOIN user_photos ON user.user_id = user_photos.user_id LEFT JOIN 
        contact_info ON user.user_id = contact_info.user_id GROUP BY user.user_id;`);
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
        const [rows] = await connection.execute(`UPDATE user SET account_status = ? WHERE user_id = ?;`, [status ,userId]);
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
    addcontactInfo
};
