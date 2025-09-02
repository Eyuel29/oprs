const { userRoles } = require('../utils/constants');
const pool = require('../config/db.config');
const storage = require('../config/firebase.config');
const { ref, uploadBytes } = require('firebase/storage');
const verifyRoles = require('../middlewares/verify_role');
const { verifyAdminSession } = require('../middlewares/verify_admin_session');
const router = require('express').Router();
const requestCache = require('../config/cache.config');
const { exec } = require('child_process');
const userData = require('../queries/query.user');
const listingData = require('../queries/query.listing');
const { Readable } = require('stream');
const { Buffer } = require('buffer');
const path = require('path');

router.use(
  '/home',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => res.redirect('/admin/metrics')
);
router.use('/signin', (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public/signin.html'))
);
router.use(
  '/signout',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => {
    res.clearCookie();
    res.redirect('/');
  }
);

router.use(
  '/metrics',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => res.render('metrics-view')
);
router.use(
  '/users',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => res.render('user-view')
);
router.use(
  '/listings',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => res.render('listing-view')
);
router.use(
  '/log',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => res.render('log-view')
);
router.use(
  '/backup',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => res.render('backup-view')
);
router.use(
  '/payments',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  (req, res) => res.render('payment-refrence-view')
);

router.use('/dashboard', (req, res) => res.render('dashboard'));

const uploadBackupData = async (dataBuffer, filename) => {
  const folderRefrence = ref(storage, `backups-${filename}`);
  const bufferStream = new Readable();
  bufferStream.push(dataBuffer);
  bufferStream.push(null);
  const chunks = [];
  bufferStream.on('data', (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    bufferStream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        await uploadBytes(folderRefrence, buffer, {
          contentType: 'application/sql',
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

router.use(
  '/createBackup',
  verifyAdminSession,
  verifyRoles(userRoles.ADMIN),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const DB_HOST = process.env.DB_HOST;
      const DB_USER = process.env.DB_USER;
      const DB_PASSWORD = process.env.DB_PASSWORD;
      const DB_DATABASE = process.env.DB_DATABASE;
      const DB_PORT = process.env.DB_PORT;
      const dumpCommand = `mysqldump -h ${DB_HOST} -u ${DB_USER} -P ${DB_PORT} -p ${DB_PASSWORD} ${DB_DATABASE}`;
      const child = exec(dumpCommand);
      let backupData = '';
      child.stdout.on('data', (data) => {
        backupData += data;
      });

      child.stdout.on('end', async () => {
        const filename = `database_backup_${Date.now()}.sql`;
        try {
          await uploadBackupData(backupData, filename);
          res.send('Backup created and uploaded successfully!');
        } catch (uploadError) {
          console.error(uploadError);
          res.status(500).send('Error uploading backup to Firebase!');
        }
      });

      child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Could not create a backup!');
    } finally {
      connection.release();
    }
  }
);

router.get('/logData', (req, res) => {
  const values = Object.values(requestCache.data);
  const logs = values.map((e) => e.v);
  res.json(logs);
});

router.get('/reportUser', async (req, res) => {
  const users = await userData.getAllUsers();
  res.json(users);
});

router.get('/reportListing', async (req, res) => {
  const listings = await listingData.getAllListings();
  res.json(listings);
});

router.use('/', (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public/home.html'))
);
module.exports = router;
