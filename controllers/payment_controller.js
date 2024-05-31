const paymentData = require('../dataAccessModule/payment_data');
const crypto = require('crypto');
const sendErrorResponse = require('../utils/sendErrorResponse');
const request = require("request");
const url = require("node:url");
const {SplitType} = require("chapa-nodejs");
const CSK = process.env.CSK;

const createSubAccount = async (req, res) =>{
    try {
        if(
            !req?.body?.account_number ||
            !req?.body?.business_name ||
            !req?.body?.account_owner_name ||
            !req?.body?.bank_id ||
            !req?.body?.bank_name
        ) {
            return sendErrorResponse(res, 400, "Incomplete information!");
        }

        const {account_number, business_name, account_owner_name, bank_id, bank_name} = req?.body;

        const response = await request.post(
            "https://api.chapa.co/v1/subaccount",
            {
            method : "POST",
            headers : {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${CSK}`,
            },
            body: JSON.stringify({
                business_name: business_name,
                account_name: account_owner_name,
                bank_code: bank_id,
                account_number: account_number,
                split_type: "percentage",
                split_value: 0.02,
                })
            },
        );

        const jsonString = response.body.toString();
        const jsonObject = JSON.parse(jsonString);
        const sub_account_id = jsonObject.data.subaccounts.id;

        const result = await paymentData.createSubAccount(
            req?.userId, account_number,
            sub_account_id, business_name,
            account_owner_name, bank_id, bank_name
        );

        if(result.affectedRows < 1) return sendErrorResponse(res, 500, "Internal server error!");
        res.status(200).json({"message" : "Sub-account created successfully!"});

    } catch (error) {
        return sendErrorResponse(res, 500, "Internal server error!");
    }
}

const initialize = async (req, res) =>{
  try{
      const paymentReceiverUserId = await paymentData.getPaymentInfo(ownerId);
      const tReference = await generateTransactionReference();
      const response = await chapa.initialize({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@gmail.com',
      currency: 'ETB',
      amount: '200',
      tx_ref: tReference,
      callback_url: 'https://example.com/',
      return_url: 'https://example.com/',
      customization: {
          title: 'Test Title',
          description: 'Test Description',
      },
      subaccounts: [
          { id: '80a510ea-7497-4499-8b49-ac13a3ab7d07'}
      ],
      });

      if(!response) return sendErrorResponse(res, 500, "Internal server error!");

      return res.status(200).json({
          "message" : "Sub-account created successfully!",
          "body" : response.data.checkout_url
      });

    }catch(error){
        return sendErrorResponse(res, 500, "Internal server error!");
    }
}

module.exports = {
    createSubAccount,
    verifyPayment,
    initialize,
}

const verifyPayment = async (req, res) =>{
    try {
        const tReference = req.param.tReference;
        if (!tReference) return sendErrorResponse(res, 400, "Couldn't verify the payment!");
        const response = await chapa.verify({tx_ref: tReference});
        const reference = {
            "first_name" : response.data.first_name ?? "",
            "last_name" : response.data.last_name ?? "",
            "email" : response.data.email ?? "",
            "currency" : response.data.currency ?? "",
            "amount" : response.data.amount ?? "",
            "charge" : response.data.charge ?? "",
            "mode" : response.data.mode ?? "",
            "method" : response.data.method ?? "",
            "type" : response.data.type ?? "",
            "status" : response.data.status ?? "",
            "reference" : response.data.reference ?? "",
            "tReference" : response.data.tx_ref ?? "",
            "created_at" : response.data.created_at ?? "",
            "updated_at" : response.data.updated_at ?? "",
        };
        const result = await paymentData.createPaymentReference(reference);
        if(result.affectedRows < 1){sendErrorResponse(res,500,"Internal server error");}
        res.status(200).json({
            "message" : "Payment successful",
            "body" : null
        });
    } catch (error) {
        return sendErrorResponse(res, 500, "Couldn't verify the payment!");
    }
}