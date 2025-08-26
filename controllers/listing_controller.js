/* eslint-disable no-unsafe-optional-chaining */
const listingData = require('../queries/listing_data');
const {
  handleFileUpload,
  uploadPhoto,
  deleteFolder,
} = require('../queries/upload_data');

const { getDate } = require('../utils/date');

const createListing = async (req, res) => {
  try {
    handleFileUpload(req, res, async (err) => {
      if (
        !req?.body?.type ||
        !req?.body?.title ||
        !req?.body?.description ||
        !req?.body?.subCity ||
        !req?.body?.woreda ||
        !req?.body?.areaName ||
        !req?.body?.latitude ||
        !req?.body?.longitude ||
        !req?.body?.paymentCurrency ||
        !req?.body?.pricePerDuration ||
        !req?.body?.totalAreaSquareMeter ||
        !req?.body?.leaseDurationDays
      ) {
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });
      }

      const ownerId = req?.userId;
      const {
        type,
        title,
        description,
        subCity,
        woreda,
        areaName,
        latitude,
        longitude,
        pricePerDuration,
        paymentCurrency,
        totalAreaSquareMeter,
        status,
        floorNumber,
        distanceFromRoadM,
        securityGuards,
        leaseDurationDays,
        taxResponsibility,
        buildingName,
        cateringRooms,
        backStages,
        furnished,
        backrooms,
        displays,
        storageCapacitySqm,
        customerServiceDesks,
        numberOfBedrooms,
        numberOfBathrooms,
        numberOfKitchens,
        parkingCapacity,
        ceilingHeightM,
        numberOfFloors,
        loadingDocks,
        guestCapacity,
      } = req?.body;
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });
      }

      const files = req?.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });
      }

      let amenities = [];
      if (req?.body?.amenities) {
        amenities = Array.from(req?.body?.amenities) ?? [];
      }

      let additionalDescriptions = [];
      if (req?.body?.additionalDescriptions) {
        additionalDescriptions =
          Array.from(req?.body?.additionalDescriptions) ?? [];
      }

      const listingResult = await listingData.createListing(
        {
          ownerId: ownerId,
          type: type,
          title: title,
          description: description,
          subCity: subCity,
          woreda: woreda,
          areaName: areaName,
          latitude: latitude,
          longitude: longitude,
          pricePerDuration: pricePerDuration,
          paymentCurrency: paymentCurrency,
          totalAreaSquareMeter: totalAreaSquareMeter,
          listingStatus: status ?? 'active',
          floorNumber: floorNumber ?? 0,
          distanceFromRoadM: distanceFromRoadM ?? 0,
          securityGuards: securityGuards ?? 0,
          leaseDurationDays: leaseDurationDays ?? 1,
          taxResponsibility: taxResponsibility ?? '',
          buildingName: buildingName ?? '',
          cateringRooms: cateringRooms ?? 0,
          backStages: backStages ?? 0,
          dateCreated: getDate(),
          furnished: furnished ?? '',
          backrooms: backrooms ?? 0,
          displays: displays ?? 0,
          storageCapacitySqm: storageCapacitySqm ?? 0,
          customerServiceDesks: customerServiceDesks ?? 0,
          numberOfBedrooms: numberOfBedrooms ?? 0,
          numberOfBathrooms: numberOfBathrooms ?? 0,
          numberOfKitchens: numberOfKitchens ?? 0,
          parkingCapacity: parkingCapacity ?? 0,
          ceilingHeightM: ceilingHeightM ?? 0,
          numberOfFloors: numberOfFloors ?? 0,
          loadingDocks: loadingDocks ?? 0,
          guestCapacity: guestCapacity ?? 0,
        },
        amenities ?? [],
        additionalDescriptions ?? []
      );

      if (listingResult.affectedRows < 1) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }

      const listingId = listingResult.insertId;

      const uploadedFiles = [];
      for (const file of req?.files) {
        try {
          const fileUrl = await uploadPhoto(file, listingId);
          uploadedFiles.push(fileUrl);
        } catch (error) {
          // eslint-disable-next-line no-undef, no-console
          console.log(error);
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
        }
      }

      if (uploadedFiles.length < 1) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }
      const photoResult = await listingData.addPhotos(listingId, uploadedFiles);
      if (photoResult.affectedRows < 1) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Successfully added the property!',
        listingId: listingId,
      });
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
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
        !req?.body?.subCity ||
        !req?.body?.woreda ||
        !req?.body?.areaName ||
        !req?.body?.latitude ||
        !req?.body?.longitude ||
        !req?.body?.pricePerDuration ||
        !req?.body?.paymentCurrency ||
        !req?.body?.totalAreaSquareMeter ||
        !req?.body?.leaseDurationDays
      ) {
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });
      }

      const listingId = req?.params?.id;
      const ownerId = req?.userId;
      const {
        type,
        title,
        description,
        subCity,
        woreda,
        areaName,
        latitude,
        longitude,
        pricePerDuration,
        paymentCurrency,
        totalAreaSquareMeter,
        status,
        floorNumber,
        distanceFromRoadM,
        securityGuards,
        leaseDurationDays,
        taxResponsibility,
        buildingName,
        cateringRooms,
        backStages,
        furnished,
        backrooms,
        displays,
        storageCapacitySqm,
        customerServiceDesks,
        numberOfBedrooms,
        numberOfBathrooms,
        numberOfKitchens,
        parkingCapacity,
        ceilingHeightM,
        numberOfFloors,
        loadingDocks,
        guestCapacity,
      } = req?.body;

      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Incomplete Information!',
        });
      }

      const listingResult = await listingData.modifyListing(listingId, {
        type: type,
        ownerId: ownerId,
        title: title,
        description: description,
        subCity: subCity,
        woreda: woreda,
        areaName: areaName,
        latitude: latitude,
        longitude: longitude,
        pricePerDuration: pricePerDuration,
        paymentCurrency: paymentCurrency,
        totalAreaSquareMeter: totalAreaSquareMeter,
        listingStatus: status ?? 'inactive',
        floorNumber: floorNumber ?? 0,
        distanceFromRoadM: distanceFromRoadM ?? 0,
        securityGuards: securityGuards ?? 0,
        leaseDurationDays: leaseDurationDays ?? 1,
        taxResponsibility: taxResponsibility ?? '',
        buildingName: buildingName ?? '',
        cateringRooms: cateringRooms ?? 0,
        backStages: backStages ?? 0,
        furnished: furnished ?? '',
        backrooms: backrooms ?? 0,
        displays: displays ?? 0,
        storageCapacitySqm: storageCapacitySqm ?? 0,
        customerServiceDesks: customerServiceDesks ?? 0,
        numberOfBedrooms: numberOfBedrooms ?? 0,
        numberOfBathrooms: numberOfBathrooms ?? 0,
        numberOfKitchens: numberOfKitchens ?? 0,
        parkingCapacity: parkingCapacity ?? 0,
        ceilingHeightM: ceilingHeightM ?? 0,
        numberOfFloors: numberOfFloors ?? 0,
        loadingDocks: loadingDocks ?? 0,
        guestCapacity: guestCapacity ?? 0,
      });

      if (listingResult.affectedRows < 1) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }

      let amenities = [];
      if (req?.body?.amenities) {
        amenities = Array.from(req?.body?.amenities) ?? [];
      }

      if (amenities && amenities.length > 0) {
        await listingData.removeAmenities(listingId);
        await listingData.addAmenities(listingId, amenities);
      } else {
        await listingData.removeAmenities(listingId);
      }

      let additionalDescriptions = [];
      if (req?.body?.additionalDescriptions) {
        additionalDescriptions =
          Array.from(req?.body?.additionalDescriptions) ?? [];
      }

      if (additionalDescriptions && additionalDescriptions.length > 0) {
        await listingData.removeDescribingTerms(listingId);
        await listingData.addDescribingTerms(listingId, additionalDescriptions);
      } else {
        await listingData.removeDescribingTerms(listingId);
      }

      const files = req?.files;
      if (!files || files.length < 1) {
        return res.status(200).json({
          success: true,
          message: 'Successfully updated the property!',
          listingId: listingId,
        });
      }

      try {
        await deleteFolder(listingId);
      } catch (error) {
        // eslint-disable-next-line no-undef, no-console
        console.log(error);
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }

      const uploadedFiles = [];
      for (const file of files) {
        try {
          const fileUrl = await uploadPhoto(file, listingId);
          uploadedFiles.push(fileUrl);
        } catch (error) {
          // eslint-disable-next-line no-undef, no-console
          console.log(error);
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error!',
          });
        }
      }

      if (uploadedFiles.length < 1) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }
      await listingData.removePhotos(listingId);
      const photoResult = await listingData.addPhotos(listingId, uploadedFiles);

      if (photoResult.affectedRows < 1) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error!',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully updated the property!',
        listingId: listingId,
      });
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const removeListing = async (req, res) => {
  try {
    const listingId = req?.params?.id;
    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const listingResult = await listingData.removeListing(listingId);
    if (listingResult.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: 'successfully deleted the property!',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getListing = async (req, res) => {
  try {
    const listingId = req?.params?.id;
    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const result = await listingData.getListing(listingId);
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'successfully retrieved the property!',
        body: result,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'No results found!',
        body: null,
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const setAvaliable = async (req, res) => {
  try {
    const listingId = req?.params?.id;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const result = await listingData.setAvailable(listingId);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: 'successfully updated the property!',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const setUnAvaliable = async (req, res) => {
  try {
    const listingId = req?.params?.id;
    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const result = await listingData.setUnAvailable(listingId);
    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: 'successfully updated the property!',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getPageListing = async (req, res) => {
  try {
    const page = req?.params?.page;

    let filterModel = req?.query
      ? Object.fromEntries(
          Object.entries(req.query)
            .filter(([_, value]) => Boolean(value))
            .map(([key, value]) => {
              if (!isNaN(value)) {
                return [key, Number(value)];
              } else if (
                value.toLowerCase() === 'true' ||
                value.toLowerCase() === 'false'
              ) {
                return [key, value.toLowerCase() === 'true'];
              } else {
                return [key, value];
              }
            })
        )
      : null;

    if (!page) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    var result = await listingData.getListingPage(page, filterModel);

    return res.status(200).json({
      success: true,
      message: `successfully loaded page ${page} listings!`,
      totalListings: result.listing_count,
      body: result.listings,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getMatchingListing = async (req, res) => {
  try {
    const page = req?.params?.page;
    const searchQuery = req?.params?.q;

    if (!page) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }
    var result = await listingData.getMatchingListing(searchQuery, page);

    return res.status(200).json({
      success: true,
      message: `successfully loaded page ${page} listings!`,
      totalListings: result.listing_count,
      body: result.listings,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getOwnerListing = async (req, res) => {
  try {
    const ownerId = req?.userId;
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const result = await listingData.getOwnerListing(ownerId);
    return res.status(200).json({
      success: true,
      message: `successfully loaded your listings!`,
      body: result,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef, no-console
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
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
