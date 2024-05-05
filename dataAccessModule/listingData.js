require('dotenv').config();
const pool = require('../config/db');

const reportListing = async (userId,listingId,reportDate,reportBody) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('INSERT INTO reports(user_id,listing_id,report_date,report_body)VALUES(?,?,?,?)', [userId,listingId,reportDate,reportBody]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    } 
} 

const getPageListing = async (page) => {
    const connection = await pool.getConnection();
    try {
        const offset = (page - 1) * 20;
        const [rows] = await connection.execute(
        `SELECT 
        listing.*,
        (SELECT JSON_ARRAYAGG(amenities.name) FROM amenities WHERE 
        amenities.listing_id = listing.listing_id) AS amenities,
        (SELECT JSON_ARRAYAGG(listing_photos.url) FROM listing_photos WHERE 
        listing_photos.listing_id = listing.listing_id) AS photo_urls
        FROM listing LIMIT 20 OFFSET ${offset};`);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }  
}

const viewListing = async (listingId) =>{
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute('UPDATE listing SET views = views + 1 WHERE listing_id = ?;', [listingId]);
        return result;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}


const createListing = async (listing) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(`INSERT INTO listing(
        listing_id,owner_id,type,title,description,sub_city,woreda,area_name,
        latLng,price_per_duration,payment_currency,total_area_square_meter,status,floor_number,
        distance_from_road_in_meters,security_guards,lease_duration_days,tax_responsibility,
        building_name,catering_rooms,back_stages,furnished,backrooms,displays,storage_capacity_square_meter,
        customer_service_desks,number_of_bedrooms,number_of_bathrooms,number_of_kitchens,parking_capacity,
        ceiling_height_in_meter,number_of_floors,loading_docks,guest_capacity) 
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
         Object.values(listing));    
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const removeListing = async (listingId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('DELETE FROM listing WHERE listing_id = ?;', [listingId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const modifyListing = async (listingId, newListing) => {
    const connection = await pool.getConnection();
    try {
      const SET_CLAUSES = Object.keys(newListing)
        .map(key => `${key} = ?`)
        .join(', ');
        const query = `
            UPDATE listing
            SET ${SET_CLAUSES}
            WHERE listing_id = ?;
        `;
  
        const values = [
            ...Object.values(newListing),
            listingId, 
        ];
  
        const [rows] = await connection.execute(query, values);
        return rows;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
}
  
const getListing = async (listingId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection
        .execute(`
        SELECT * FROM listing WHERE listing.listing_id = ?;`,
        [listingId]);
        return rows[0];
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}

const setAvaliable = async (listingId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
        'UPDATE listing SET ? =  WHERE listing_id = ?;', [1000,listingId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
} 

const setUnAvaliable = async (listingId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
        'UPDATE listing SET ? =  WHERE listing_id = ?;', [2000,listingId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }     
}

const addAmenities = async (listing_id, amenities) => {
    const connection = await pool.getConnection();
    try {
      const placeholders = amenities.map(() => '(?, ?)').join(',');
      const values = amenities.reduce((acc, amenity) => {
        acc.push(listing_id, amenity.amenityName);
        return acc;
      }, []);
      const query = `INSERT INTO amenities (listing_id, name) VALUES ${placeholders}`;
      const [rows] = await connection.execute(query, values);
      return rows;
    } catch (err) {
      throw err;
    }finally{
        connection.release();
    }
};


const removeAmenities = async (listing_id) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`DELETE FROM amenities WHERE listing_id = ?;`, [listing_id]);
      return result;
    } catch (err) {
      throw err;
    }finally{
        connection.release();
    }
};

const addphotos = async (listing_id, urls) => {
    const connection = await pool.getConnection();
    try {
      const placeholders = urls.map(() => '(?, ?)').join(',');
      const values = urls.reduce((acc, url) => {
        acc.push(listing_id, url);
        return acc;
      }, []);
      const query = `INSERT INTO listing_photos (listing_id, url) VALUES ${placeholders}`;
      const [rows] = await connection.execute(query, values);
      return rows;
    } catch (err) {
      throw err;
    }finally{
        connection.release();
    }
};


const removephotos = async (listing_id) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`DELETE FROM listing_photos WHERE listing_id = ?`, [listing_id]);
      return result;
    } catch (err) {
      throw err;
    }finally{
        connection.release();
    }
};
  
module.exports = {
    createListing,getListing,getPageListing,
    modifyListing,removeListing,setAvaliable,
    setUnAvaliable,reportListing,viewListing,
    addphotos,removephotos,addAmenities,
    removeAmenities
}