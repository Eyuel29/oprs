const listingData = require('../dataAccessModule/listing_data');
const { handleFileUpload, uploadPhoto } = require('../dataAccessModule/upload_data');
const sendErrorResponse = require('../utils/sendErrorResponse');
const crypto = require('crypto');

const createListing = async (req, res) =>{
    try {
        handleFileUpload(req, res, async (err) => {
            console.log(req.body);
            if(
                !req?.body?.owner_id ||
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
            ){
                return sendErrorResponse(res,400,"Incomplete information!");
            }
        
            const {owner_id,type,title,description,
                sub_city,woreda,area_name,latitude,longitude,price_per_duration,
                payment_currency,total_area_square_meter,status,
                floor_number,distance_from_road_in_meters,security_guards,
                lease_duration_days,tax_responsibility,building_name,
                catering_rooms,back_stages,furnished,backrooms,
                displays,storage_capacity_square_meter,customer_service_desks,
                number_of_bedrooms,number_of_bathrooms,number_of_kitchens,
                parking_capacity,ceiling_height_in_meter,number_of_floors,
                loading_docks,guest_capacity
            } = req?.body;

            const listing_id = crypto.randomUUID();

            if (err) {
              return sendErrorResponse(res, 400, "Only upto 10 pieces of media files of a jpg | png | mp4 which are less than 5MB are allowed!");
            }

            const files = req?.files;
            if (!listing_id || !files || files.length === 0) {
              return sendErrorResponse(res, 400, "Incomplete information!");
            }

            const listing_Result = await listingData.createListing(
                {
                    listing_id,owner_id,type,title,description,
                    sub_city,woreda,area_name,latitude,longitude,price_per_duration,
                    payment_currency,total_area_square_meter,
                    "status" : status ?? 1000,
                    "floor_number" : floor_number ?? 0,
                    "distance_from_road_in_meters" : distance_from_road_in_meters ?? 0,
                    "security_guards" : security_guards ?? 0,
                    "lease_duration_days" : lease_duration_days ?? 1,
                    "tax_responsibility" : tax_responsibility ?? "",
                    "building_name" : building_name ?? "",
                    "catering_rooms" : catering_rooms ?? 0,
                    "back_stages" : back_stages ?? 0,
                    "furnished" : furnished ?? "",
                    "backrooms" : backrooms ?? 0,
                    "displays" : displays ?? 0,
                    "storage_capacity_square_meter" : storage_capacity_square_meter ?? 0,
                    "customer_service_desks" : customer_service_desks ?? 0,
                    "number_of_bedrooms" : number_of_bedrooms ?? 0,
                    "number_of_bathrooms" : number_of_bathrooms ?? 0,
                    "number_of_kitchens" : number_of_kitchens ?? 0,
                    "parking_capacity" : parking_capacity ?? 0,
                    "ceiling_height_in_meter" : ceiling_height_in_meter ?? 0,
                    "number_of_floors" : number_of_floors ?? 0,
                    "loading_docks" : loading_docks ?? 0,
                    "guest_capacity" :guest_capacity ?? 0 
                }
                
            );

            if (req?.body?.amenities) {
                const aResult = await listingData.addAmenities(listing_id, req?.body?.amenities);   
            }
         
            if (listing_Result.affectedRows < 1) {
              return sendErrorResponse(res, 409, "Something went wrong!");
            }

            const uploadedFiles = [];   
            for (const file of files) {
              try{
                    const fileUrl = await uploadPhoto(file);
                    uploadedFiles.push(fileUrl);
                 } catch (error) {
                    console.log(error);
                    return sendErrorResponse(res, 500, "Could not upload the files!");
                 }
            }

            if (uploadedFiles.length < 1) {     
                return sendErrorResponse(res, 500, "Something went wrong!");  
            }

            const photoResult = await listingData.addphotos(listing_id, uploadedFiles);   
         
            if (photoResult.affectedRows < 1) {
              return sendErrorResponse(res, 500, "Something went wrong!");
            }

            return res.status(200).json({
                success: true,
                message: "Successfully added the property!",
                listing_id: listing_id
            });
          });
        
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const removeListing = async (req, res) =>{
    try {
        const listing_id = req?.params?.id;
        if (!listing_id) {
            return sendErrorResponse(res,400,"Incomplete information!");
        }
    
        const listingResult = await listingData.removeListing(listing_id);
        await listingData.removeListing(listing_id);
        await listingData.removeListing(listing_id);

        if (listingResult.affectedRows > 0) {
            return res.status(200).json({
                success : true,
                message : "successfully deleted the property!",
            });
        }
        return sendErrorResponse(res,500,"Internal server error, unable to delete the proeprty!");
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const modifyListing = async (req, res) =>{
    try {
        handleFileUpload(req, res, async (err) => {
            if(
                !req?.params?.id ||
                !req?.body?.owner_id ||
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
            ){
                return sendErrorResponse(res,400,"Incomplete information!");
            }
        
            const listing_id = req?.params?.id;
            const {type,title,description,
                sub_city,woreda,area_name,latitude,longitude,price_per_duration,
                payment_currency,total_area_square_meter,status,
                floor_number,distance_from_road_in_meters,security_guards,
                lease_duration_days,tax_responsibility,building_name,
                catering_rooms,back_stages,furnished,backrooms,
                displays,storage_capacity_square_meter,customer_service_desks,
                number_of_bedrooms,number_of_bathrooms,number_of_kitchens,
                parking_capacity,ceiling_height_in_meter,number_of_floors,
                loading_docks,guest_capacity
            } = req?.body;

            if (err) {
              return sendErrorResponse(res, 400, "Only upto 10 pieces of media files of a jpg | png | mp4 which are less than 5MB are allowed!");
            }
            
            const listing_Result = await listingData.modifyListing(
                listing_id,
                {
                    type,title,description,
                    sub_city,woreda,area_name,latitude,longitude,price_per_duration,
                    payment_currency,total_area_square_meter,
                    "status" : status ?? 1000,
                    "floor_number" : floor_number ?? 0,
                    "distance_from_road_in_meters" : distance_from_road_in_meters ?? 0,
                    "security_guards" : security_guards ?? 0,
                    "lease_duration_days" : lease_duration_days ?? 1,
                    "tax_responsibility" : tax_responsibility ?? "",
                    "building_name" : building_name ?? "",
                    "catering_rooms" : catering_rooms ?? 0,
                    "back_stages" : back_stages ?? 0,
                    "furnished" : furnished ?? "",
                    "backrooms" : backrooms ?? 0,
                    "displays" : displays ?? 0,
                    "storage_capacity_square_meter" : storage_capacity_square_meter ?? 0,
                    "customer_service_desks" : customer_service_desks ?? 0,
                    "number_of_bedrooms" : number_of_bedrooms ?? 0,
                    "number_of_bathrooms" : number_of_bathrooms ?? 0,
                    "number_of_kitchens" : number_of_kitchens ?? 0,
                    "parking_capacity" : parking_capacity ?? 0,
                    "ceiling_height_in_meter" : ceiling_height_in_meter ?? 0,
                    "number_of_floors" : number_of_floors ?? 0,
                    "loading_docks" : loading_docks ?? 0,
                    "guest_capacity" :guest_capacity ?? 0 
                }
                
            );

            if (listing_Result.affectedRows < 1) {
                return sendErrorResponse(res, 409, "Something went wrong!");
            }

            if (req?.body?.amenities) {
                await listingData.removeAmenities(listing_id);
                const aResult = await listingData.addAmenities(listing_id, req?.body?.amenities);   
            }else{
                await listingData.removeAmenities(listing_id);
            }
            const uploadedFiles = [];   
            if (!req?.files || req?.files.length < 1) {
                return res.status(200).json({
                    success: true,
                    message: "Successfully updated the property!",
                    listing_id: listing_id
                });
            }

            for (const file of req?.files) {    
              try{
                    const fileUrl = await uploadPhoto(file);
                    uploadedFiles.push(fileUrl);
                 } catch (error) {
                    console.log(error);
                    return sendErrorResponse(res, 500, "Could not upload the files!");
                 }
            }

            if (uploadedFiles.length < 1) {     
                return sendErrorResponse(res, 500, "Something went wrong!");  
            }

            const photoDeleteResult = await listingData.removephotos(listing_id);   
            const photoResult = await listingData.addphotos(listing_id, uploadedFiles);        

            if (photoResult.affectedRows < 1) {
              return sendErrorResponse(res, 500, "Something went wrong!");
            }

            return res.status(200).json({
                success: true,
                message: "Successfully updated the property!",
                listing_id: listing_id
            });
          });
        
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const getListing = async (req, res) =>{
    try {
        const listing_id = req?.params?.id;

        if (!listing_id) {
            return sendErrorResponse(res,400,"Incomplete information!");
        }

        const result = await listingData.getListing(listing_id);    
        if (result) {
            return res.status(200).json({
                    success : true,
                    message : "successfully retrieved the property!",
                    body : result
            });
        }else{
            return res.status(200).json({
                    success : false,
                    message : "No results found!",
                    body : null
            });
        }
    } catch (error) {
        console.log(error);
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const setAvaliable = async (req, res) =>{
    try {
        const listing_id = req?.params?.id;

        if (!listing_id) {
            return sendErrorResponse(res,400,"Incomplete information!");
        }
    
        const result = await listingData.setAvaliable(listing_id);
        if (result.affectedRows > 0) {
            return res.status(200).json({
                success : true,
                message : "successfully updated the property!",
            });
        }
        return sendErrorResponse(res,400,"Unable to update the item!");
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
} 

const setUnAvaliable = async (req, res) =>{
    try {
        const listing_id = req?.params?.id;

        if (!listing_id) {
            return sendErrorResponse(res,400,"Incomplete information!");
        }
    
        const result = await listingData.setUnAvaliable(listing_id);
        if (result.affectedRows > 0) {
            return res.status(200).json({
                success : true,
                message : "successfully updated the property!",
            });
        }
        return sendErrorResponse(res,400,"Unable to update the item!");
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const getPageListing = async (req, res) => {
    try {
      const page = req?.params?.page;
      const filterModel = req?.body.filterModel;

      if (!page) { return sendErrorResponse(res, 400, "Incomplete information!"); }
      var count = await listingData.getListingPage(page, filterModel);
      var result = count.length < 1 ? [] : await listingData.getListingPage(page, filterModel); 
      return res.status(200).json({
          success: true,
          message: `successfully loaded page ${page} listings!`,
          totalListings : count,
          body: result
      });
    } catch (error) {
      console.log(error);
      return sendErrorResponse(res, 500, "Internal server error!");
    }
}


const getOwnerListing = async (req, res) => {
    try {
      const owner_id = req?.params?.id;
      if (!owner_id) { return sendErrorResponse(res, 400, "Incomplete information!"); }
      const result = await listingData.getOwnerListing(owner_id); 
      return res.status(200).json({
          success: true,
          message: `successfully loaded your listings!`,
          body: result
      });
    } catch (error) {
      console.log(error);
      return sendErrorResponse(res, 500, "Internal server error!");
    }
}


module.exports = {
    createListing,
    removeListing, 
    getPageListing,
    getOwnerListing,
    modifyListing, 
    getListing, 
    setAvaliable, 
    setUnAvaliable
}