const paymentData = require('../dataAccessModule/payment_data');
const { getUser } = require('../dataAccessModule/user_data');
const sendErrorResponse = require('../utils/sendErrorResponse');
const crypto = require('crypto');
const axios = require('axios');
const CSK = process.env.CSK;

const deleteSubAccount = async (req, res) =>{
    try {
        if (!req?.userId) return sendErrorResponse(res, 400, "Payment initialization failed!");
        const userId = req?.userId;
        const deleteSubAccountResullt = await paymentData.deleteSubAccount(userId);

        if (deleteSubAccountResullt.affectedRows < 1) return sendErrorResponse(
            res,
            500,
            "Internal server error, Couldn't delete the sub-accunt!"
        );

        res.status(200).json({ 
            "success" : true,
            "message" : "Your sub-account has been deleted!"
        });

    } catch (error) {
        return sendErrorResponse(res, 500, "Internal server error!");
    }
}

const getPaymentInfo = async (req, res) =>{
    try {
        const owner_id = req?.params?.id;
        if(!owner_id) return sendErrorResponse(res, 400, "Invalid information, no owner specified!");

        const paymentInfo = await paymentData.getPaymentInfo(owner_id);
        if(!paymentInfo) return sendErrorResponse(res, 404, "The owner has no payment information specified!");

        res.status(200).json({ 
            "success" : true,
            "body" : paymentInfo,
            "message" : "Successfully retrieved payment informtion!"
        });

    } catch (error) {
        return sendErrorResponse(res, 500, "Internal server error!");
    }
}

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
        const response = await axios.post(
            "https://api.chapa.co/v1/subaccount",
            {
                business_name: business_name,
                account_name: account_owner_name,
                bank_code: bank_id,
                account_number: account_number,
                split_type: "percentage",
                split_value: 0.02,
            },{
            headers : {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${CSK}`,
               }
            },
        );

        const sub_account_id = response.data.data["subaccounts[id]"];

        if (!req?.userId) return sendErrorResponse(res, 400, "There is something wrong with the data you provided!");

        const result = await paymentData.createSubAccount(
            req?.userId, 
            account_number,
            sub_account_id,
            business_name,
            account_owner_name,
            bank_id,
            bank_name
        );

        if(result.affectedRows < 1) return sendErrorResponse(res, 500, "Internal server error!");
        return res.status(200).json({
            "success" : true,
            "message" : "Sub-account created successfully!"
        });

    } catch (error) {
        console.log(error);
        return sendErrorResponse(res, 500, "Internal server error, Couldn't create the subaccount!");
    }
}

const initialize = async (req, res) =>{
  try{
    if (!req?.userId) return sendErrorResponse(res, 400, "Payment initialization failed!");
    const userId = req?.userId;

    const paymentReceiverData = await paymentData.getPaymentInfo(ownerId);
    if (!paymentReceiverData) return sendErrorResponse(
        res,
        500,
        "Internal server error, Couldn't initialize the payment!"
    );

    if (!req?.body?.title ||
        !req?.body?.description ||
        !req?.body?.amount ||
        !req?.body?.currency 
    ) return sendErrorResponse(res, 400, "Incomplete information!");

    const {title,description,amount,currency} = req?.body;

    const payee = await getUser(userId);
    if (!payee) return sendErrorResponse(res, 400, "Payment initialization failed!");
    
    const {full_name,phone_number, email} = payee;
    const nameArray = full_name.split(' ');

    const fname = nameArray[0];
    const lname = nameArray.length > 1 ? nameArray[1] : "NA";

    const txsuffix = crypto.randomBytes(8).toString('hex');
    const txReference = `OPRS-${txsuffix}`;

    const response = await axios.post(
        "https://api.chapa.co/v1/transaction/initialize",{
          first_name: fname,
          last_name: lname,
          email: email,
          currency: currency,
          amount: amount,
          tx_ref: txReference,
          phone_number: phone_number,
          callback_url: 'https://example.com/',
          return_url: '',
          "customization[title]": title ?? 'Title',
          "customization[description]": description ?? 'Description',
          "subaccounts[id]": "a9dbdf67-603e-4b75-bab3-884cca206ee5"
        },{
        headers : {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CSK}`,
           }
        },
    );

    res.status(200).json({ 
        "success" : true,
        "body" : response.data.data,
        "message" : "Use this link for checkout!"
    });

    }catch(error){
        return sendErrorResponse(res, 500, "Internal server error!");
    }
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

module.exports = {
    createSubAccount,
    deleteSubAccount,
    verifyPayment,
    initialize,
    getPaymentInfo
}