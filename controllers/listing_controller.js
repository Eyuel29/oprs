const listingData = require("../queries/listing_data");
const {
  handleFileUpload,
  uploadPhoto,
  deleteFolder,
} = require("../queries/upload_data");

const { getDate } = require("../utils/date");

const createListing = async (req, res) => {
  try {
    handleFileUpload(req, res, async (err) => {
      if (
        !req?.body?.type ||
        !req?.body?.title ||
        !req?.body?.description ||
        !req?.body?.sub_city ||
        !req?.body?.woreda ||
        !req?.body?.area_name ||
        !req?.body?.latitude ||
        !req?.body?.longitude ||
        !req?.body?.payment_currency ||
        !req?.body?.price_per_duration ||
        !req?.body?.total_area_square_meter ||
        !req?.body?.lease_duration_days
      )
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });

      const owner_id = req?.userId;
      const {
        type,
        title,
        description,
        sub_city,
        woreda,
        area_name,
        latitude,
        longitude,
        price_per_duration,
        payment_currency,
        total_area_square_meter,
        status,
        floor_number,
        distance_from_road_in_meters,
        security_guards,
        lease_duration_days,
        tax_responsibility,
        building_name,
        catering_rooms,
        back_stages,
        furnished,
        backrooms,
        displays,
        storage_capacity_square_meter,
        customer_service_desks,
        number_of_bedrooms,
        number_of_bathrooms,
        number_of_kitchens,
        parking_capacity,
        ceiling_height_in_meter,
        number_of_floors,
        loading_docks,
        guest_capacity,
      } = req?.body;
      if (err)
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });

      const files = req?.files;

      if (!files || files.length === 0)
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });

      let amenities = [];
      if (req?.body?.amenities) {
        amenities = Array.from(req?.body?.amenities) ?? [];
      }

      let describing_terms = [];
      if (req?.body?.describing_terms) {
        describing_terms = Array.from(req?.body?.describing_terms) ?? [];
      }

      const listing_Result = await listingData.createListing(
        {
          owner_id: owner_id,
          type: type,
          title: title,
          description: description,
          sub_city: sub_city,
          woreda: woreda,
          area_name: area_name,
          latitude: latitude,
          longitude: longitude,
          price_per_duration: price_per_duration,
          payment_currency: payment_currency,
          total_area_square_meter: total_area_square_meter,
          listing_status: status ?? 3000,
          floor_number: floor_number ?? 0,
          distance_from_road_in_meters: distance_from_road_in_meters ?? 0,
          security_guards: security_guards ?? 0,
          lease_duration_days: lease_duration_days ?? 1,
          tax_responsibility: tax_responsibility ?? "",
          building_name: building_name ?? "",
          catering_rooms: catering_rooms ?? 0,
          back_stages: back_stages ?? 0,
          date_created: getDate(),
          furnished: furnished ?? "",
          backrooms: backrooms ?? 0,
          displays: displays ?? 0,
          storage_capacity_square_meter: storage_capacity_square_meter ?? 0,
          customer_service_desks: customer_service_desks ?? 0,
          number_of_bedrooms: number_of_bedrooms ?? 0,
          number_of_bathrooms: number_of_bathrooms ?? 0,
          number_of_kitchens: number_of_kitchens ?? 0,
          parking_capacity: parking_capacity ?? 0,
          ceiling_height_in_meter: ceiling_height_in_meter ?? 0,
          number_of_floors: number_of_floors ?? 0,
          loading_docks: loading_docks ?? 0,
          guest_capacity: guest_capacity ?? 0,
        },
        amenities ?? [],
        describing_terms ?? []
      );

      if (listing_Result.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });

      const listing_id = listing_Result.insertId;

      const uploadedFiles = [];
      for (const file of req?.files) {
        try {
          const fileUrl = await uploadPhoto(file, listing_id);
          uploadedFiles.push(fileUrl);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
        }
      }

      if (uploadedFiles.length < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });
      const photoResult = await listingData.addPhotos(
        listing_id,
        uploadedFiles
      );
      if (photoResult.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });

      return res.status(201).json({
        success: true,
        message: "Successfully added the property!",
        listing_id: listing_id,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const modifyListing = async (req, res) => {
  try {
    handleFileUpload(req, res, async (err) => {
      if (
        !req?.params?.id ||
        !req?.body?.type ||
        !req?.body?.title ||
        !req?.body?.description ||
        !req?.body?.sub_city ||
        !req?.body?.woreda ||
        !req?.body?.area_name ||
        !req?.body?.latitude ||
        !req?.body?.longitude ||
        !req?.body?.price_per_duration ||
        !req?.body?.payment_currency ||
        !req?.body?.total_area_square_meter ||
        !req?.body?.lease_duration_days
      ) {
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });
      }

      const listing_id = req?.params?.id;
      const owner_id = req?.userId;
      const {
        type,
        title,
        description,
        sub_city,
        woreda,
        area_name,
        latitude,
        longitude,
        price_per_duration,
        payment_currency,
        total_area_square_meter,
        status,
        floor_number,
        distance_from_road_in_meters,
        security_guards,
        lease_duration_days,
        tax_responsibility,
        building_name,
        catering_rooms,
        back_stages,
        furnished,
        backrooms,
        displays,
        storage_capacity_square_meter,
        customer_service_desks,
        number_of_bedrooms,
        number_of_bathrooms,
        number_of_kitchens,
        parking_capacity,
        ceiling_height_in_meter,
        number_of_floors,
        loading_docks,
        guest_capacity,
      } = req?.body;

      if (err)
        return res.status(400).json({
          success: false,
          message: "Incomplete Information!",
        });

      const listing_Result = await listingData.modifyListing(listing_id, {
        type: type,
        owner_id: owner_id,
        title: title,
        description: description,
        sub_city: sub_city,
        woreda: woreda,
        area_name: area_name,
        latitude: latitude,
        longitude: longitude,
        price_per_duration: price_per_duration,
        payment_currency: payment_currency,
        total_area_square_meter: total_area_square_meter,
        listing_status: status ?? 1000,
        floor_number: floor_number ?? 0,
        distance_from_road_in_meters: distance_from_road_in_meters ?? 0,
        security_guards: security_guards ?? 0,
        lease_duration_days: lease_duration_days ?? 1,
        tax_responsibility: tax_responsibility ?? "",
        building_name: building_name ?? "",
        catering_rooms: catering_rooms ?? 0,
        back_stages: back_stages ?? 0,
        furnished: furnished ?? "",
        backrooms: backrooms ?? 0,
        displays: displays ?? 0,
        storage_capacity_square_meter: storage_capacity_square_meter ?? 0,
        customer_service_desks: customer_service_desks ?? 0,
        number_of_bedrooms: number_of_bedrooms ?? 0,
        number_of_bathrooms: number_of_bathrooms ?? 0,
        number_of_kitchens: number_of_kitchens ?? 0,
        parking_capacity: parking_capacity ?? 0,
        ceiling_height_in_meter: ceiling_height_in_meter ?? 0,
        number_of_floors: number_of_floors ?? 0,
        loading_docks: loading_docks ?? 0,
        guest_capacity: guest_capacity ?? 0,
      });

      if (listing_Result.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });

      let amenities = [];
      if (req?.body?.amenities)
        amenities = Array.from(req?.body?.amenities) ?? [];

      if (amenities && amenities.length > 0) {
        await listingData.removeAmenities(listing_id);
        await listingData.addAmenities(listing_id, amenities);
      } else {
        await listingData.removeAmenities(listing_id);
      }

      let describing_terms = [];
      if (req?.body?.describing_terms)
        describing_terms = Array.from(req?.body?.describing_terms) ?? [];

      if (describing_terms && describing_terms.length > 0) {
        await listingData.removeDescribingTerms(listing_id);
        await listingData.addDescribingTerms(listing_id, describing_terms);
      } else {
        await listingData.removeDescribingTerms(listing_id);
      }

      const files = req?.files;
      if (!files || files.length < 1) {
        return res.status(200).json({
          success: true,
          message: "Successfully updated the property!",
          listing_id: listing_id,
        });
      }

      try {
        await deleteFolder(listing_id);
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });
      }

      const uploadedFiles = [];
      for (const file of files) {
        try {
          const fileUrl = await uploadPhoto(file, listing_id);
          uploadedFiles.push(fileUrl);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: "Internal Server Error!",
          });
        }
      }

      if (uploadedFiles.length < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });
      await listingData.removePhotos(listing_id);
      const photoResult = await listingData.addPhotos(
        listing_id,
        uploadedFiles
      );

      if (photoResult.affectedRows < 1)
        return res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        });

      return res.status(200).json({
        success: true,
        message: "Successfully updated the property!",
        listing_id: listing_id,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const removeListing = async (req, res) => {
  try {
    const listing_id = req?.params?.id;
    if (!listing_id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });
    const listingResult = await listingData.removeListing(listing_id);
    if (listingResult.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "successfully deleted the property!",
      });
    }
    return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getListing = async (req, res) => {
  try {
    const listing_id = req?.params?.id;
    if (!listing_id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });

    const result = await listingData.getListing(listing_id);
    if (result) {
      return res.status(200).json({
        success: true,
        message: "successfully retrieved the property!",
        body: result,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No results found!",
        body: null,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const setAvaliable = async (req, res) => {
  try {
    const listing_id = req?.params?.id;

    if (!listing_id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });
    const result = await listingData.setAvailable(listing_id);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "successfully updated the property!",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const setUnAvaliable = async (req, res) => {
  try {
    const listing_id = req?.params?.id;
    if (!listing_id)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });

    const result = await listingData.setUnAvailable(listing_id);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "successfully updated the property!",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getPageListing = async (req, res) => {
  try {
    const page = req?.params?.page;

    let filterModel = req?.query
      ? Object.fromEntries(
          Object.entries(req.query)
            .filter(([key, value]) => Boolean(value))
            .map(([key, value]) => {
              if (!isNaN(value)) {
                return [key, Number(value)];
              } else if (
                value.toLowerCase() === "true" ||
                value.toLowerCase() === "false"
              ) {
                return [key, value.toLowerCase() === "true"];
              } else {
                return [key, value];
              }
            })
        )
      : null;

    if (!page)
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
    });
    var result = await listingData.getListingPage(page, filterModel);

    return res.status(200).json({
      success: true,
      message: `successfully loaded page ${page} listings!`,
      totalListings: result.listing_count,
      body: result.listings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getMatchingListing = async (req, res) => {
  try {
    const page = req?.params?.page;
    const searchQuery = req?.params?.q;

    if (!page)
      return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
      });
    var result = await listingData.getMatchingListing(searchQuery, page);

    return res.status(200).json({
      success: true,
      message: `successfully loaded page ${page} listings!`,
      totalListings: result.listing_count,
      body: result.listings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

const getOwnerListing = async (req, res) => {
  try {
    const owner_id = req?.userId;
    if (!owner_id) {
      return res.status(400).json({
        success: false,
        message: "Incomplete Information!",
      });
    }

    const result = await listingData.getOwnerListing(owner_id);
    return res.status(200).json({
      success: true,
      message: `successfully loaded your listings!`,
      body: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

module.exports = {
  createListing,
  removeListing,
  getPageListing,
  getOwnerListing,
  modifyListing,
  getListing,
  getMatchingListing,
  setAvaliable,
  setUnAvaliable,
};
