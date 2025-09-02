/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */

const notificationTypes = require('../config/notification_types');
const notificationData = require('../queries/query.notification');
const paymentData = require('../queries/query.payment');
const { getUser } = require('../queries/query.user');
const { getDate } = require('../utils/date');
const crypto = require('crypto');
const instance = require('axios');
const CSK = process.env.CSK;

const axios = instance.create({
  validateStatus: function (status) {
    return status < 500;
  },
});

const deleteSubAccount = async (req, res) => {
  try {
    if (!req?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const userId = req?.userId;
    const deleteSubAccountResullt = await paymentData.deleteSubAccount(userId);

    if (deleteSubAccountResullt.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Your sub-account has been deleted!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getPaymentInfo = async (req, res) => {
  try {
    const ownerId = req?.params?.id;
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const paymentInfo = await paymentData.getPaymentInfo(ownerId);
    if (!paymentInfo) {
      res.status(404).json({
        success: false,
        message: 'No payment information!',
      });
    }
    res.status(200).json({
      success: true,
      body: paymentInfo.subaccountId,
      message: 'Successfully retrieved payment informtion!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const getMyPaymentInfo = async (req, res) => {
  try {
    const ownerId = req?.userId;
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const paymentInfo = await paymentData.getPaymentInfo(ownerId);
    if (!paymentInfo) {
      return res.status(404).json({
        success: false,
        message: 'No payment information!',
      });
    }

    res.status(200).json({
      success: true,
      body: paymentInfo,
      message: 'Successfully retrieved payment informtion!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const createSubAccount = async (req, res) => {
  try {
    if (
      !req?.body?.accountNumber ||
      !req?.body?.businessName ||
      !req?.body?.accountOwnerName ||
      !req?.body?.bankId ||
      !req?.body?.bankName
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    if (!req?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const { accountNumber, businessName, accountOwnerName, bankId, bankName } =
      req?.body;

    const response = await axios.post(
      'https://api.chapa.co/v1/subaccount',
      {
        business_name: businessName,
        account_name: accountOwnerName,
        bank_code: bankId,
        account_number: accountNumber,
        split_type: 'percentage',
        split_value: 0.02,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CSK}`,
        },
      }
    );

    const subaccountId = response.data.data['subaccounts[id]'];

    const result = await paymentData.createSubAccount(
      req?.userId,
      accountNumber,
      subaccountId,
      businessName,
      accountOwnerName,
      bankId,
      bankName
    );

    if (result.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }
    return res.status(201).json({
      success: true,
      message: 'Sub-account created successfully!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const initialize = async (req, res) => {
  try {
    if (
      !req?.body?.title ||
      !req?.body?.description ||
      !req?.body?.amount ||
      !req?.body?.currency ||
      !req?.body?.receiverId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    if (!req?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }
    const userId = req?.userId;
    const ownerId = req?.body?.receiverId;

    const paymentReceiverData = await paymentData.getPaymentInfo(
      req?.body?.receiverId
    );
    if (!paymentReceiverData) {
      return res.status(404).json({
        success: false,
        message: 'No payment information!',
      });
    }

    const { title, description, amount, currency } = req?.body;

    const payee = await getUser(userId);
    if (!payee) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete Information!',
      });
    }

    const { fullName, phoneNumber, email } = payee;
    const nameArray = fullName.split(' ');

    const fname = nameArray[0];
    const lname = nameArray.length > 1 ? nameArray[1] : 'NA';

    const txsuffix = crypto.randomBytes(8).toString('hex');
    const txReference = `OPRS-${txsuffix}`;

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        first_name: fname,
        last_name: lname,
        email: email,
        currency: currency,
        amount: amount,
        txref: txReference,
        phone_number: phoneNumber,
        callback_url: `https://oprs.vercel.app/payment/verify/${txReference}`,
        return_url: '',
        'customization[title]': title ?? 'Title',
        'customization[description]': description ?? 'Description',
        'subaccounts[id]': 'a9dbdf67-603e-4b75-bab3-884cca206ee5',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CSK}`,
        },
      }
    );
    await paymentData.createPaymentReference(userId, ownerId, txReference);
    res.status(200).json({
      success: true,
      body: {
        checkOutLink: response.data.data,
        txRef: txReference,
      },
      message: 'Use this link for checkout!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const tReference = req?.params?.txref;
    if (!tReference) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tReference}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CSK}`,
        },
      }
    );

    const reference = {
      firstName: response.data.data.first_name ?? '',
      lastName: response.data.data.last_name ?? '',
      email: response.data.data.email ?? '',
      currency: response.data.data.currency ?? '',
      amount: response.data.data.amount ?? 0,
      charge: response.data.data.charge ?? 0,
      mode: response.data.data.mode ?? '',
      method: response.data.data.method ?? '',
      type: response.data.data.type ?? '',
      status: response.data.data.status ?? '',
      reference: response.data.data.reference ?? '',
      tReference: response.data.data.txref ?? '',
      createdAt: response.data.data.created_at ?? '',
      updatedAt: response.data.data.updated_at ?? '',
    };

    const result = await paymentData.verifyPaymentReference(reference);

    if (result.affectedRows < 1) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!',
      });
    }

    const paymentRefrence = await paymentData.getPaymentReference(tReference);

    await notificationData.createNotification(
      paymentRefrence.tenantId,
      paymentRefrence.ownerId,
      notificationTypes.PAYMENT,
      'Payment Received',
      `Dear User You have received a payment from ${
        paymentRefrence.firstName
      } ${paymentRefrence.lastName} for the amount of ${
        paymentRefrence.amount
      } in ${paymentRefrence.currency} with the charge of ${
        paymentRefrence.charge
      } with the total of ${
        paymentRefrence.amount - paymentRefrence.charge
      } The transaction reference is ${
        paymentRefrence.reference
      }. Thank you for using our service!`,
      getDate()
    );

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      body: null,
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
  createSubAccount,
  deleteSubAccount,
  verifyPayment,
  initialize,
  getPaymentInfo,
  getMyPaymentInfo,
};
