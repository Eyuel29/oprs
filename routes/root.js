const router = require('express').Router();
const multer  = require('multer');
const path = require('path');
const { saveFileToS3 } = require('../dataAccessModule/uploadData');

router.get('/', (req, res) => {
    res.send("WAM");
});

router.post('/', async (req, res) => {
    const uploadedFiles = [];
    upload(req, res, async (err) =>{
       req.files.forEach( async (file) =>{
        await saveFileToS3(file);
       });
    });
    res.send(req.body)
});

module.exports = router;
