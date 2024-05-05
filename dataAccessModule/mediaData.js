var admin = require("firebase-admin");

var serviceAccount = require('../config/oprs-3b110-firebase-adminsdk-ipqtk-fc26c4fa81.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket : "oprs-3b110.appspot.com"
});

const storage = admin.storage();
const bucket = storage.bucket();

const up = async () =>{
    const res = await bucket.upload("/home/eyuel/Documents/OPRS/config/oprs-3b110-firebase-adminsdk-ipqtk-fc26c4fa81.json");
    console.log(res);
}

up();
