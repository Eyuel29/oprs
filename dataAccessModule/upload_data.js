const multer = require('multer');
const crypto = require('crypto');

const {
  getStorage, ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll} = require('firebase/storage');

const app = require('../config/firebase_config');
const storage = getStorage(app);

const handleFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mov'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Only image (JPEG/PNG) or video (MP4/ MOV) files are allowed!'));
      return;
    }
    cb(null, true);
  }
}).array('files', 10);



// const updatePhoto = async (url, file) => {
//   try {
//     await deletePhoto(ref(storage, url));
//     const uploadResult = await uploadBytes(ref(storage,url),file.buffer);
//     return {
//       ref : uploadResult.ref.fullPath,
//       url : getDownloadURL(uploadResult.ref)
//     };
//   } catch (error) {
//     throw error
//   }
// }

const uploadPhoto = async (file, destinationPath) => {
  try {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const folderRefrence = ref(storage, `listing-${destinationPath}`);
    const fileName = file.fieldname + '-' + uniqueSuffix + file.originalname;
    const fileRefrence = ref(folderRefrence, fileName);

    const uploadResult = await uploadBytes(fileRefrence,file.buffer);
    const dl = await getDownloadURL(uploadResult.ref)
    return dl;
  } catch (error) {
    throw error;
  }
};

const deleteFolder = async (folderPath) => {
  try {
    const r = ref(storage, `listing-${folderPath}`);
    const listResult = await listAll(r);
    listResult.items.map(async (fileRef) => await deleteObject(fileRef));
    return;
  } catch (error) {
    throw error;
  }
};


module.exports = { handleFileUpload, uploadPhoto, deleteFolder};