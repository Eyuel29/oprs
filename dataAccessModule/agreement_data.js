require('dotenv').config();
const pool = require('../config/db');
const {toTimestamp} = require('../utils/date');

const createAgreement = async (agreement, lease_duration, check_in_date) => {
    const connection = await pool.getConnection();
    try {
      const { tenant_id, owner_id, listing_id } = agreement;
      const lease_start_date = toTimestamp(check_in_date);
  
      const lease_duration_mill = lease_duration * 24 * 60 * 60 * 1000;
      const lease_end_date = lease_start_date + lease_duration_mill;

      const [result] = await connection.execute(
        `INSERT INTO agreement(
          tenant_id,
          owner_id,
          listing_id,
          lease_start_date,
          lease_end_date
        ) VALUES(?,?,?,?,?);`,
        [tenant_id, owner_id, listing_id, lease_start_date, lease_end_date]
      );
  
      return result;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
};


const getAgreements = async (user_id) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            `SELECT agreement.*,
                    JSON_OBJECT(
                        "full_name", tenant_user.full_name,
                        "url", tenant_photos.url
                    ) AS tenant,
                    JSON_OBJECT(
                        "full_name", owner_user.full_name,
                        "url", owner_photos.url
                    ) AS owner
             FROM agreement
             LEFT JOIN user AS tenant_user ON agreement.tenant_id = tenant_user.user_id
             LEFT JOIN user_photos AS tenant_photos ON tenant_user.user_id = tenant_photos.user_id
             LEFT JOIN user AS owner_user ON agreement.owner_id = owner_user.user_id
             LEFT JOIN user_photos AS owner_photos ON owner_user.user_id = owner_photos.user_id
             WHERE agreement.owner_id = ? OR agreement.tenant_id = ?;`,
            [user_id, user_id]
        );
        
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const cancelAgreements = async (tenant_id, reservation_id) =>{
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute('DELETE FROM agreement WHERE tenant_id = ?;',[tenant_id]);
        return result;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

module.exports = {
    cancelAgreements,
    createAgreement,
    getAgreements
};
