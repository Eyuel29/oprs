require('dotenv').config();
const pool = require('../config/db.config');

const reportListing = async (userId, listingId, reportDate, reportBody) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'INSERT INTO reports(userId,listingId,report_date,report_body)VALUES(?,?,?,?)',
      [userId, listingId, reportDate, reportBody]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getListingCount = async (filterModel) => {
  const connection = await pool.getConnection();
  try {
    let whereClause = ` listingStatus = 'inactive' `;
    let AND = '';
    for (const property in filterModel) {
      if (whereClause) AND = 'AND';
      if (filterModel.hasOwnProperty(property)) {
        const value = filterModel[property];
        switch (typeof value) {
          case 'string':
            if (property === 'latitude' || property === 'longitude') {
              whereClause += ` ${AND} listing.${property} like '${value.substring(0, 5)}'`;
            } else {
              whereClause += ` ${AND} listing.${property} = '${value}'`;
            }
            break;
          case 'number':
            if (property === 'minimum_price') {
              whereClause += ` ${AND} listing.pricePerDuration > ${value}`;
            } else if (property === 'maximum_price') {
              whereClause += ` ${AND} listing.pricePerDuration < ${value}`;
            } else {
              whereClause += ` ${AND} listing.${property} = ${value}`;
            }
            break;
          default:
            break;
        }
      }
    }

    const selectionQuery = `
    SELECT COUNT(*) AS listing_count FROM listing ${
      whereClause
        ? `
    WHERE ${whereClause.slice(4)}`
        : ''
    };`;

    const [rows] = await connection.execute(selectionQuery);
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getListingPage = async (page, filterModel) => {
  const connection = await pool.getConnection();
  connection.beginTransaction();

  try {
    const offset = (page - 1) * 40;
    let whereClause = ` listingStatus = 'active' `;
    let AND = '';

    if (filterModel) {
      const filteredModel = Object.fromEntries(
        Object.entries(filterModel).filter(([_, value]) => Boolean(value))
      );

      for (const property in filteredModel) {
        if (whereClause) AND = 'AND';
        if (filteredModel.hasOwnProperty(property)) {
          const value = filteredModel[property];
          switch (typeof value) {
            case 'string':
              if (property === 'latitude' || property === 'longitude') {
                whereClause += ` ${AND} listing.${property} LIKE '${value.substring(0, 5)}%'`;
              } else {
                whereClause += ` ${AND} listing.${property} = '${value}'`;
              }
              break;
            case 'number':
              if (property === 'minimum_price') {
                whereClause += ` ${AND} listing.pricePerDuration > ${value}`;
              } else if (property === 'maximum_price') {
                whereClause += ` ${AND} listing.pricePerDuration < ${value}`;
              } else {
                whereClause += ` ${AND} listing.${property} = ${value}`;
              }
              break;
            default:
              break;
          }
        }
      }
    }

    const selectionQuery = `
      WITH ListingCount AS (
        SELECT COUNT(*) AS listing_count
        FROM listing
        ${whereClause ? `WHERE ${whereClause}` : ''}
      )
      SELECT 
        listing.*,
        (SELECT JSON_ARRAYAGG(amenities.name) FROM amenities WHERE amenities.listingId = listing.listingId) AS amenities,
        (SELECT COUNT(*) FROM reviews WHERE reviews.reviewedListingId = listing.listingId) AS review_count,
        (SELECT FLOOR(AVG(rating)) FROM reviews WHERE reviews.reviewedListingId = listing.listingId) AS average_rating,
        (SELECT JSON_ARRAYAGG(additionalDescriptions.term) FROM additionalDescriptions WHERE additionalDescriptions.listingId = listing.listingId) AS additionalDescriptions,
        (SELECT JSON_ARRAYAGG(listingPhotos.url) FROM listingPhotos WHERE listingPhotos.listingId = listing.listingId) AS photo_urls,
        (SELECT listing_count FROM ListingCount) AS listing_count
      FROM listing
      ${whereClause ? `WHERE ${whereClause}` : ''}
      LIMIT 40 OFFSET ${offset};`;

    const [rows] = await connection.execute(selectionQuery);

    if (rows && rows.length > 0) {
      const listingCount = rows[0].listing_count;
      if (listingCount === 0) {
        connection.commit();
        return { listing_count: 0, listings: [] };
      }

      const listings = rows.map((row) => {
        delete row.listing_count;
        return row;
      });

      const listingIds = listings.map((l) => l.listingId);
      const idList = listingIds.join(',');
      const updateQuery = `UPDATE listing SET views = views + 1 WHERE listingId IN (${idList})`;
      await connection.execute(updateQuery);

      connection.commit();
      return { listing_count: listingCount, listings: listings };
    } else {
      connection.commit();
      return { listing_count: 0, listings: [] };
    }
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const getAllListings = async () => {
  const connection = await pool.getConnection();
  connection.beginTransaction();

  try {
    const selectionQuery = `
      SELECT 
        listing.*,
        (SELECT JSON_ARRAYAGG(amenities.name) FROM amenities WHERE amenities.listingId = listing.listingId) AS amenities,
        (SELECT COUNT(*) FROM reviews WHERE reviews.reviewedListingId = listing.listingId) AS review_count,
        (SELECT FLOOR(AVG(rating)) FROM reviews WHERE reviews.reviewedListingId = listing.listingId) AS average_rating,
        (SELECT JSON_ARRAYAGG(additionalDescriptions.term) FROM additionalDescriptions WHERE additionalDescriptions.listingId = listing.listingId) AS additionalDescriptions,
        (SELECT user.fullName FROM user WHERE user.userId = listing.ownerId) AS owner,
        (SELECT JSON_ARRAYAGG(listingPhotos.url) FROM listingPhotos WHERE listingPhotos.listingId = listing.listingId) AS photo_urls FROM listing;`;

    const [rows] = await connection.execute(selectionQuery);

    return rows;
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const getMatchingListing = async (searchQuery, page) => {
  const connection = await pool.getConnection();
  try {
    const offset = (page - 1) * 40;
    let whereClause = ` WHERE listing.listingStatus = 'active' `;
    let searchValues = [];

    if (searchQuery) {
      const searchColumns = [
        'title',
        'description',
        'buildingName',
        'subCity',
        'woreda',
        'areaName',
      ];
      const searchConditions = searchColumns
        .map((column) => `listing.${column} LIKE ?`)
        .join(' OR ');
      const describingTermsCondition = 'additionalDescriptions.term LIKE ?';
      whereClause += ` AND (${searchConditions} OR ${describingTermsCondition})`;
      searchValues = Array(searchColumns.length)
        .fill(`%${searchQuery}%`)
        .concat(`%${searchQuery}%`);
    }

    const countQuery = `
      SELECT COUNT(DISTINCT listing.listingId) AS listing_count
      FROM listing
      LEFT JOIN additionalDescriptions ON listing.listingId = additionalDescriptions.listingId
      ${whereClause};`;

    const [countResult] = await connection.execute(countQuery, searchValues);
    const listing_count = countResult[0].listing_count;

    const selectionQuery = `SELECT listing.*, COALESCE((SELECT JSON_ARRAYAGG(amenities.name)
     FROM amenities WHERE amenities.listingId = listing.listingId), JSON_ARRAY()) AS amenities,
      COALESCE((SELECT COUNT(*) FROM reviews WHERE reviews.reviewedListingId = listing.listingId), 0) AS review_count,
      COALESCE((SELECT FLOOR(AVG(rating)) FROM reviews WHERE reviews.reviewedListingId = listing.listingId), 0) AS average_rating, 
      COALESCE((SELECT JSON_ARRAYAGG(additionalDescriptions.term) FROM additionalDescriptions WHERE additionalDescriptions.listingId = listing.listingId), JSON_ARRAY()) AS additionalDescriptions, 
      COALESCE((SELECT JSON_ARRAYAGG(listingPhotos.url) FROM listingPhotos WHERE listingPhotos.listingId = listing.listingId), JSON_ARRAY()) AS photo_urls 
      FROM listing LEFT JOIN additionalDescriptions ON listing.listingId = additionalDescriptions.listingId ${whereClause} 
      GROUP BY listing.listingId LIMIT 40 OFFSET ${offset};`;

    const [rows] = await connection.execute(selectionQuery, searchValues);

    if (rows && rows.length > 0) {
      const listingIds = rows.map((l) => l.listingId);
      const idList = listingIds.join(',');
      const updateQuery = `UPDATE listing SET views = views + 1 WHERE listingId IN (${idList})`;
      await connection.execute(updateQuery);
    }

    return { listing_count, listings: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getOwnerListing = async (ownerId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT listing.*,
      COALESCE((SELECT JSON_ARRAYAGG(amenities.name) 
          FROM amenities 
          WHERE amenities.listingId = listing.listingId), JSON_ARRAY()
      ) AS amenities,
      COALESCE((SELECT COUNT(*) 
          FROM reviews 
          WHERE reviews.reviewedListingId = listing.listingId), 0
      ) AS review_count,
      COALESCE((SELECT FLOOR(AVG(rating)) 
          FROM reviews 
          WHERE reviews.reviewedListingId = listing.listingId), 0
      ) AS average_rating,
      COALESCE((SELECT JSON_ARRAYAGG(additionalDescriptions.term) 
          FROM additionalDescriptions 
          WHERE additionalDescriptions.listingId = listing.listingId), JSON_ARRAY()
      ) AS additionalDescriptions,
      COALESCE((SELECT JSON_ARRAYAGG(listingPhotos.url) 
          FROM listingPhotos 
          WHERE listingPhotos.listingId = listing.listingId), JSON_ARRAY()
      ) AS photo_urls FROM listing 
      WHERE listing.ownerId = ? GROUP BY listing.listingId;`,
      [ownerId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const createListing = async (listing, amenities, additionalDescriptions) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const [rows] = await connection.execute(
      `INSERT INTO listing(
      ownerId,type,title,description,subCity,woreda,areaName,latitude,longitude,
      pricePerDuration,paymentCurrency,totalAreaSquareMeter,listingStatus,
      floorNumber,distanceFromRoadM,securityGuards,leaseDurationDays,
      taxResponsibility,buildingName,cateringRooms,backStages,dateCreated,furnished,
      backrooms,displays,storageCapacitySqm,customerServiceDesks,numberOfBedrooms,
      numberOfBathrooms,numberOfKitchens,parkingCapacity,ceilingHeightM,numberOfFloors,
      loadingDocks,guestCapacity) 
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
      Object.values(listing)
    );

    if (amenities && amenities.length > 0) {
      const amenitiesPlaceholders = amenities.map(() => '(?, ?)').join(',');
      const amenitiesValues = [];
      Object.values(amenities).map((v, i) => {
        amenitiesValues.push(rows.insertId);
        amenitiesValues.push(v);
      });
      const amenitiesQuery = `INSERT INTO amenities (listingId,name) VALUES ${amenitiesPlaceholders}`;
      await connection.execute(amenitiesQuery, amenitiesValues);
    }

    if (additionalDescriptions && additionalDescriptions.length > 0) {
      const dTplaceholders = additionalDescriptions
        .map(() => '(?, ?)')
        .join(',');
      const dTvalues = [];
      Object.values(additionalDescriptions).map((v, i) => {
        dTvalues.push(rows.insertId);
        dTvalues.push(v);
      });
      const dTquery = `INSERT INTO additionalDescriptions (listingId,term) VALUES ${dTplaceholders}`;
      await connection.execute(dTquery, dTvalues);
    }
    await connection.commit();
    return rows;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const modifyListing = async (listingId, newListing) => {
  const connection = await pool.getConnection();
  try {
    const SET_CLAUSES = Object.keys(newListing)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `
          UPDATE listing
          SET ${SET_CLAUSES}
          WHERE listingId = ?;
      `;
    const values = [...Object.values(newListing), listingId];
    const [rows] = await connection.execute(query, values);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const removeListing = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'DELETE FROM listing WHERE listingId = ?;',
      [listingId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getListing = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
          listing.*,COALESCE((SELECT JSON_ARRAYAGG(amenities.name) 
          FROM amenities WHERE amenities.listingId = listing.listingId), JSON_ARRAY()
          ) AS amenities,
          COALESCE((SELECT COUNT(*) FROM reviews WHERE reviews.reviewedListingId = listing.listingId), 0
          ) AS review_count,
          COALESCE((SELECT FLOOR(AVG(rating)) FROM reviews 
              WHERE reviews.reviewedListingId = listing.listingId), 0
          ) AS average_rating,
          COALESCE((SELECT JSON_ARRAYAGG(additionalDescriptions.term) FROM additionalDescriptions 
              WHERE additionalDescriptions.listingId = listing.listingId), JSON_ARRAY()
          ) AS additionalDescriptions,
          COALESCE((SELECT JSON_ARRAYAGG(listingPhotos.url) FROM listingPhotos 
              WHERE listingPhotos.listingId = listing.listingId), JSON_ARRAY()
          ) AS photo_urls FROM listing 
          WHERE listing.listingId = ? GROUP BY listing.listingId;`,
      [listingId]
    );
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const setAvailable = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'UPDATE listing SET listingStatus = ? WHERE listingId = ?;',
      ['active', listingId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const setUnAvailable = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'UPDATE listing SET listingStatus = ? WHERE listingId = ?;',
      ['inacive', listingId]
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const addDescribingTerms = async (listingId, additionalDescriptions) => {
  const connection = await pool.getConnection();
  try {
    const placeholders = additionalDescriptions.map(() => '(?, ?)').join(',');
    const values = [];

    Object.values(additionalDescriptions).map((v, i) => {
      values.push(listingId);
      values.push(v);
    });

    const query = `INSERT INTO additionalDescriptions (listingId, term) VALUES ${placeholders}`;
    const [rows] = await connection.execute(query, values);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const removeDescribingTerms = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `DELETE FROM additionalDescriptions WHERE listingId = ?;`,
      [listingId]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const addAmenities = async (listingId, amenities) => {
  const connection = await pool.getConnection();
  try {
    const placeholders = amenities.map(() => '(?, ?)').join(',');
    const values = [];

    Object.values(amenities).map((v, i) => {
      values.push(listingId);
      values.push(v);
    });

    const query = `INSERT INTO amenities (listingId, name) VALUES ${placeholders}`;
    const [rows] = await connection.execute(query, values);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};
const removeAmenities = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `DELETE FROM amenities WHERE listingId = ?;`,
      [listingId]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const addPhotos = async (listingId, urls) => {
  const connection = await pool.getConnection();
  try {
    const placeholders = urls.map(() => '(?, ?)').join(',');
    const values = [];

    Object.values(urls).map((v, i) => {
      values.push(listingId);
      values.push(v);
    });

    const query = `INSERT INTO listingPhotos (listingId,url) VALUES ${placeholders}`;
    const [rows] = await connection.execute(query, values);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const removePhotos = async (listingId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `DELETE FROM listingPhotos WHERE listingId = ?`,
      [listingId]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  createListing,
  getListing,
  getOwnerListing,
  modifyListing,
  removeListing,
  setAvailable,
  setUnAvailable,
  reportListing,
  addPhotos,
  removePhotos,
  addAmenities,
  removeAmenities,
  getListingPage,
  getAllListings,
  getMatchingListing,
  getListingCount,
  addDescribingTerms,
  removeDescribingTerms,
};
