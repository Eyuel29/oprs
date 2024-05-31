const { createPaymentReference } = require('../dataAccessModule/payment_data');
const sendErrorResponse = require('../utils/sendErrorResponse');
/*
enum SplitType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

interface Subaccount {
  id: string;
  split_type?: SplitType;
  transaction_charge?: number;
}

interface InitializeOptions {
  first_name: string;
  last_name: string;
  email: string;
  currency: string;
  amount: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  subaccounts?: Subaccount[];
}

interface InitializeResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
  };
}

interface VerifyOptions {
  tx_ref: string;
}

interface VerifyResponse {
  message: string;
  status: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: string;
    charge: string;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    customization: {
      title: string;
      description: string;
      logo: string;
    };
    meta: any;
    created_at: Date;
    updated_at: Date;
  };
}

type Currency = 'ETB' | 'USD';

interface Data {
  id: string;
  swift: string;
  name: string;
  acct_length: number;
  country_id: number;
  created_at: Date;
  updated_at: Date;
  is_rtgs: boolean | null;
  is_mobilemoney: boolean | null;
  currency: Currency;
}

interface GetBanksResponse {
  message: string;
  data: Data[];
}

interface CreateSubaccountOptions {
  business_name: string;
  account_name: string;
  bank_code: string;
  account_number: string;
  split_type: SplitType;
  split_value: number;
}

interface CreateSubaccountResponse {
  message: string;
  status: string;
  data: string;
}

subaccounts: [
    {
      id: '80a510ea-7497-4499-8b49-ac13a3ab7d07',
      split_type: SplitType.FLAT,
      transaction_charge: 25
    },
  ]
*/

const { Chapa, SplitType } = require('chapa-nodejs');

const chapa = new Chapa(
    {secretKey : process.env.CSK}
);


const initializePayment = async () =>{
    const tx_ref = await chapa.generateTransactionReference();
    const response = await chapa.initialize({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@gmail.com',
      currency: 'ETB',
      amount: '200',
      tx_ref: tx_ref,
      callback_url: 'https://example.com/',
      return_url: 'https://example.com/',
      customization: {
        title: 'Test Title',
        description: 'Test Description',
      },
    });
}


const initializeMobile = async (req, res) => { 
    const {} = req.user;
    const tx_ref = await chapa.generateTransactionReference();
    const response = await chapa.mobileInitialize({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@gmail.com',
        currency: 'ETB',
        amount: '200',
        tx_ref: tx_ref,
        callback_url: 'https://example.com/',
        return_url: 'https://example.com/',
        customization: {
            title: 'Test Title',
            description: 'Test Description',
        },
    });
}

const verifyPayment = async (req, res) =>{
  try {
    const tx_ref = req.param.tx_ref;
    if (!tx_ref) {return sendErrorResponse(res, 400, "Couldn't verify the payment!");}
    const response = await chapa.verify({tx_ref: tx_ref});
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
      "tx_ref" : response.data.tx_ref ?? "",
      "title" : response.data.title ?? "",
      "description" : response.data.description ?? "",
      "created_at" : response.data.created_at ?? "",
      "updated_at" : response.data.updated_at ?? "",
    };

    const result = await createPaymentReference(reference);
  } catch (error) {
    return sendErrorResponse(res, 500, "Couldn't verify the payment!");
  }
}

const createSubAccount = async () =>{
    const response = await chapa.createSubaccount({
      business_name: 'Test Business',
      account_name: 'John Doe',
      bank_code: '80a510ea-7497-4499-8b49-ac13a3ab7d07', // Get this from the `getBanks()` method
      account_number: '0123456789',
      split_type: SplitType.PERCENTAGE,
      split_value: 0.02,
    });


}

const initializeWithSplit = async (req, res) =>{
    const tx_ref = await chapa.generateTransactionReference();
    const response = chapa.initialize({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@gmail.com',
      currency: 'ETB',
      amount: '200',
      tx_ref: tx_ref,
      callback_url: 'https://example.com/',
      return_url: 'https://example.com/',
      customization: {
        title: 'Test Title',
        description: 'Test Description',
      },
      // Add this for split payment
      subaccounts: [
        {
          id: '80a510ea-7497-4499-8b49-ac13a3ab7d07',
          split_type: SplitType.PERCENTAGE,
          split_value : 2
        },
      ],
    });
}



