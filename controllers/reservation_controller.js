const reservationData = require('../dataAccessModule/reservation_data');
const notificationData = require('../dataAccessModule/notification_data');
const sendErrorResponse = require('../utils/sendErrorResponse');
const notificationTypes = require('../config/notification_types');
const getDate = require('../utils/date');
const crypto = require('crypto');

const requestReservation = async (req, res) =>{
    try {
        if( !req?.body?.tenant_id ||
            !req?.body?.owner_id ||
            !req?.body?.listing_id ||
            !req?.body?.selected_payment_method ||
            !req?.body?.price_offer ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const {tenant_id,owner_id,listing_id,selected_payment_method,price_offer} = req?.body;
        const reservation_id = crypto.randomUUID();
        const date = getDate();
        const reservationResult = await reservationData.createRequest(
            {reservation_id,tenant_id,owner_id,listing_id,selected_payment_method,date,price_offer}
        );
        if (reservationResult.affectedRows < 1) {
            return sendErrorResponse(res, 409, "Something went wrong!");
        }

        const notification_id = crypto.randomUUID();
        await notificationData.createNotification(
            notification_id,
            tenant_id,
            owner_id,
            notificationTypes.APPROVE,
            "Reservation Approved!",
            "Your reservation has been approved!",
            getDate()
        );

        return res.status(200).json({
            success: true,
            message: "Successfully made a reservation request!",
            reservation_id: reservation_id
        });
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const cancelReservation = async (req, res) =>{
    try {
        if( !req?.params?.id ){return sendErrorResponse(res,400,"Incomplete information!");}
        const reservation_id = req?.params?.id;
        const tenant_id = req?.userId;
        const result = await reservationData.cancelReservation(tenant_id, reservation_id);
        if (result.affectedRows > 0) {
            return res.status(200).json({
                success : true,
                message : "successfully cancelled the reservaiton request!",
            });
        }
        return sendErrorResponse(res,500,"Internal server error, unable to cancel the reservaiton request!");
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const approveReservationRequest = async (req, res) =>{
    try {
        if( !req?.params?.id ){return sendErrorResponse(res,400,"Incomplete information!");}
        const reservation_id = req?.params?.id;
        const owner_id = req?.userId;
        const result = await reservationData.appoveReservation(owner_id, reservation_id);
        if (result.affectedRows < 1) {return sendErrorResponse(res,400,"Unable to update the property!");}
        const reservation = await reservationData.getReservation(owner_id, reservation_id);
        const notification_id = crypto.randomUUID();
        await notificationData.createNotification(
            notification_id,
            reservation.tenant_id,
            owner_id,
            notificationTypes.APPROVE,
            "Reservation Approved!",
            "Your reservation has been approved!",
            getDate()
        );

        return res.status(200).json({
            success : true,
            message : "successfully approved the reservation request!",
        });

    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const declineReservationRequest = async (req, res) =>{
    try {
        if( !req?.params?.id ){
            return sendErrorResponse(res,400,"Incomplete information!");
        }
        const reservation_id = req?.params?.id;
        const owner_id = req?.userId;
        const result = await reservationData.declineReservation(owner_id, reservation_id);
        if (result.affectedRows < 1) {return sendErrorResponse(res,400,"Unable to decline the reservation!");}
        const reservation = await reservationData.getReservation(owner_id, reservation_id);
        const notification_id = crypto.randomUUID();
        await notificationData.createNotification(
            notification_id,
            reservation.tenant_id,
            owner_id,
            notificationTypes.DECLINE,
            "Reservation declined!",
            "Your reservation has been declined!",
            getDate()
        );

        return res.status(200).json({
            success : true,
            message : "Reservation declined!",
        });

    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

const getReservations = async (req, res) => {
    try { 
        const owner_id = req?.userId;
        const result = await reservationData.getReservations(owner_id);
        return res.status(200).json({
            success : true,
            message : "Successfully loaded requests!",
            body : result
        });

    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}


const getTenantReservations = async (req, res) => {
    try {
        const tenant_id = req?.userId;
        const result = await reservationData.getRequests(tenant_id);
        return res.status(200).json({
            success : true,
            message : "Successfully loaded your requests!",
            body : result
        });
    } catch (error) {
        return sendErrorResponse(res,500,"Internal server error!");
    }
}

module.exports = {
    getReservations,  
    approveReservationRequest,
    declineReservationRequest,
    requestReservation,
    cancelReservation,
    getTenantReservations,
}