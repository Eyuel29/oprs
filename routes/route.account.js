const router = require('express').Router();
const verifyController = require('../controllers/controller.verify');
const accountController = require('../controllers/controller.account');
const { verifySession } = require('../middlewares/verify_session');

router.post('/restore', accountController.restoreAccount);
router.post(
  '/restoreAccountVerify/:key',
  accountController.restoreAccountVerify
);
router.put('/restorePassword', accountController.restoreAccountPassword);
router.put('/updatePassword', verifySession, accountController.changePassword);
router.put('/modify', verifySession, accountController.modifyProfile);
router.get('/signout', verifySession, accountController.signout);
router.post('/verify/:key', verifyController.verifyPost);
router.get(
  '/agreement/:id',
  verifySession,
  accountController.getUserAgreements
);
router.get('/myAgreement', verifySession, accountController.getMyAgreements);
router.get('/verify', verifySession, verifyController.verifyGet);
module.exports = router;
