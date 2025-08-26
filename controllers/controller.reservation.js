/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-unsafe-optional-chaining */
const reservationData = require('../queries/reservation_data');
const notificationData = require('../queries/notification_data');
const agreementData = require('../queries/agreement_data');
const listingData = require('../queries/listing_data');

const { getDate } = require('../utils/date');
const notificationTypes = require('../config/notification_types');

const requestReservation = async (req, res) => {
  try {
    if (
      !req?.body?.ownerId ||
      !req?.body?.listingId ||
      !req?.body?.selectedPaymentMethod ||
      !req?.body?.tenantName ||
      !req?.body?.additionalMessage ||
      !req?.body?.stayDates
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const tenantId = req?.userId;
    const {
      ownerId,
      listingId,
      tenantName,
      selectedPaymentMethod,
      additionalMessage,
    } = req?.body;
    const priceOffer = 0;
    const date = getDate();

    const stayDates =
      typeof req?.body?.stayDates === 'string'
        ? JSON.parse(req?.body?.stayDates)
        : typeof req?.body?.stayDates === 'object'
          ? Array.from(req?.body?.stayDates)
          : [];

    if (!stayDates) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const reservationResult = await reservationData.createRequest({
      tenantId,
      ownerId,
      tenantName,
      listingId,
      selectedPaymentMethod,
      date,
      priceOffer,
      stayDates,
      additionalMessage,
    });

    if (reservationResult.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }

    const reservationId = reservationResult.insertId;
    await notificationData.createNotification(
      tenantId,
      ownerId,
      notificationTypes.EVENT,
      'New Reservation!',
      'Some one is interested in your listing!',
      getDate()
    );

    return res.status(201).json({
      success: true,
      message: 'Successfully made a reservation request!',
      reservationId: reservationId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const cancelReservation = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const reservationId = req?.params?.id;
    const tenantId = req?.userId;
    const result = await reservationData.cancelReservation(
      tenantId,
      reservationId
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: 'successfully cancelled the reservaiton request!',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const approveReservationRequest = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const reservationId = req?.params?.id;
    const ownerId = req?.userId;
    const result = await reservationData.appoveReservation(
      ownerId,
      reservationId
    );

    if (result.affectedRows < 1) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const reservation = await reservationData.getReservation(
      ownerId,
      reservationId
    );
    const listing = await listingData.getListing(reservation.listingId);

    const agreement = {
      tenantId: reservation.tenantId,
      ownerId: ownerId,
      listingId: reservation.listingId,
    };

    const leaseDuration = listing.leaseDurationDays;
    const checkInDate = reservation.stayDates[0] ?? new Date().toISOString();

    await agreementData.createAgreement(agreement, leaseDuration, checkInDate);
    await listingData.setUnAvailable(listing.listingId);

    await notificationData.createNotification(
      ownerId,
      reservation.tenantId,
      notificationTypes.APPROVE,
      'Reservation approved!',
      'Contact the owner for more details, you can use our app to make your payments.',
      getDate()
    );

    return res.status(200).json({
      success: true,
      message: 'successfully approved the reservation request!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const declineReservationRequest = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const reservationId = req?.params?.id;
    const ownerId = req?.userId;
    const result = await reservationData.declineReservation(
      ownerId,
      reservationId
    );
    if (result.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }
    const reservation = await reservationData.getReservation(
      ownerId,
      reservationId
    );

    await notificationData.createNotification(
      reservation.tenantId,
      ownerId,
      notificationTypes.DECLINE,
      'Reservation declined!',
      'Your reservation has been declined!',
      getDate()
    );

    return res.status(200).json({
      success: true,
      message: 'Reservation declined!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getReservations = async (req, res) => {
  try {
    const ownerId = req?.userId;
    const result = await reservationData.getReservations(ownerId);
    return res.status(200).json({
      success: true,
      message: 'Successfully loaded requests!',
      body: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getTenantReservations = async (req, res) => {
  try {
    const tenantId = req?.userId;
    const result = await reservationData.getReservations(tenantId);

    return res.status(200).json({
      success: true,
      message: 'Successfully loaded your requests!',
      body: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getAgreements = async (req, res) => {
  try {
    const userId = req?.params.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const result = await agreementData.getAgreements(userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No agreements found!',
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully loaded user's agreements!",
      body: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

module.exports = {
  getReservations,
  approveReservationRequest,
  declineReservationRequest,
  requestReservation,
  cancelReservation,
  getTenantReservations,
  getAgreements,
};
