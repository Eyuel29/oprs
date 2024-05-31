const multer = require('multer');
const crypto = require('crypto');

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} = require('firebase/storage');

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


const uploadPhoto = async (file) => {
  try {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    const fileName = file.fieldname + '-' + uniqueSuffix + file.originalname;
    const uploadResult = await uploadBytes(ref(storage,fileName),file.buffer);
    return getDownloadURL(uploadResult.ref);
  } catch (error) {
    throw error
  }
}

module.exports = { handleFileUpload, uploadPhoto };