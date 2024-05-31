require('dotenv').config();
const pool = require('../config/db');

const reportListing = async (userId,listingId,reportDate,reportBody) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.
        execute('INSERT INTO reports(user_id,listing_id,report_date,report_body)VALUES(?,?,?,?)',
         [userId,listingId,reportDate,reportBody]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    } 
}
const getListingCount = async (filterModel) => {
  const connection = await pool.getConnection();
  try {
    let whereClause = '';
    let AND = '';

    for (const property in filterModel) {
        
        if(whereClause){
            AND = 'AND';
        }
        
      if (filterModel.hasOwnProperty(property)) {
        const value = filterModel[property];
        switch (typeof value) {
          case 'string':
            if (property === 'latitude' || property === 'longitude') {
                whereClause += ` ${AND} listing.${property} like '${value.substring(0,5)}'`;
            }else{
                whereClause += ` ${AND} listing.${property} = '${value}'`;
            }
            break;
          case 'number':
            if (property === 'minimum_price') {
              whereClause += ` ${AND} listing.price_per_duration > ${value}`;
            } else if (property === 'maximum_price') {
                whereClause += ` ${AND} listing.price_per_duration < ${value}`;
            }else {
              whereClause += ` ${AND} listing.${property} = ${value}`;
            }
            break;
          default:
            break;
        }
      }
    }
    const selectionQuery = `
      SELECT
        COUNT(*) AS listing_count FROM listing
      ${whereClause ? `WHERE ${whereClause.slice(4)}` : ''};`;
    const [rows] = await connection.execute(selectionQuery);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
}
const getListingPage = async (page, filterModel) => {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * 20;
      let whereClause = '';
      let AND = '';

      for (const property in filterModel) {
        if(whereClause){
            AND = 'AND';
        }
        
      if (filterModel.hasOwnProperty(property)) {
        const value = filterModel[property];
        switch (typeof value) {
          case 'string':
            if (property === 'latitude' || property === 'longitude') {
                whereClause += ` ${AND} listing.${property} like '${value.substring(0,5)}'`;
            }else{
                whereClause += ` ${AND} listing.${property} = '${value}'`;
            }
            break;
          case 'number':
            if (property === 'minimum_price') {
              whereClause += ` ${AND} listing.price_per_duration > ${value}`;
            } else if (property === 'maximum_price') {
                whereClause += ` ${AND} listing.price_per_duration < ${value}`;
            }else {
              whereClause += ` ${AND} listing.${property} = ${value}`;
            }
            break;
          default:
            break;
        }
      }
      }
      const selectionQuery = `
        SELECT
          listing.*,
          (SELECT JSON_ARRAYAGG(amenities.name) FROM amenities WHERE amenities.listing_id = listing.listing_id) AS amenities,
          (SELECT COUNT(*) FROM reviews WHERE reviews.reviewed_listing_id = listing.listing_id) AS review_count,
          (SELECT FLOOR(AVG(rating)) FROM reviews WHERE reviews.reviewed_listing_id = listing.listing_id) AS average_rating,
          (SELECT JSON_ARRAYAGG(describing_terms.term) FROM describing_terms WHERE describing_terms.listing_id = listing.listing_id) AS describing_terms,
          (SELECT JSON_ARRAYAGG(listing_photos.url) FROM listing_photos WHERE listing_photos.listing_id = listing.listing_id) AS photo_urls
        FROM listing
        ${whereClause ? `WHERE ${whereClause.slice(4)}` : ''} LIMIT 20 OFFSET ${offset};`;
      const [rows] = await connection.execute(selectionQuery);
      return rows;
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
  }
const getOwnerListing = async (owner_id) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
        `SELECT
        listing.*,
        (SELECT JSON_ARRAYAGG(amenities.name) FROM amenities WHERE amenities.listing_id = listing.listing_id) AS amenities,
        (SELECT COUNT(*) FROM reviews WHERE reviews.reviewed_listing_id = listing.listing_id) AS review_count,
        (SELECT FLOOR(AVG(rating)) FROM reviews WHERE reviews.reviewed_listing_id = listing.listing_id) AS average_rating,
        (SELECT JSON_ARRAYAGG(describing_terms.term) FROM describing_terms WHERE describing_terms.listing_id = listing.listing_id) AS describing_terms,
        (SELECT JSON_ARRAYAGG(listing_photos.url) FROM listing_photos WHERE listing_photos.listing_id = listing.listing_id) AS photo_urls
        FROM listing WHERE listing.owner_id = ?;`, [owner_id]); // <-- Pass owner_id as a parameter
        return rows;
    } catch (err) {
        throw err;
    } finally {
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
        latitude,longitude,price_per_duration,payment_currency,total_area_square_meter,listing_status,floor_number,
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
const setAvailable = async (listingId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
        'UPDATE listing SET listing_status = ? WHERE listing_id = ?;', [3000,listingId]);
        return rows;
    } catch (err) {
        throw err;
    }finally{
        connection.release();
    }
}
const setUnAvailable = async (listingId) =>{
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
        'UPDATE listing SET listing_status = ? WHERE listing_id = ?;', [1000,listingId]);
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
const addPhotos = async (listing_id, urls) => {
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
const removePhotos = async (listing_id) => {
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
    createListing,getListing,getOwnerListing,
    modifyListing,removeListing,setAvailable,
    setUnAvailable,reportListing,viewListing,
    addPhotos,removePhotos,addAmenities,
    removeAmenities, getListingPage, getListingCount
}