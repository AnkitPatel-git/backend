// import express router
const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fs = require('fs');
// multer start

const multer = require("multer");
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = imageBaseDir+'uploads/images/profile/';
    fs.mkdirSync(dest, { recursive: true })
        cb(null, dest);
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
  }
});
const upload = multer({ storage: storage });
// multer end
let verifyToken = require('../../middleware/verifytokenadmin');
//
let adminauthcontroller = require('../../controllers/admin/adminauthcontroller');
let profilecontroller = require('../../controllers/admin/profilecontroller');
// import feauth controller

router.post("/postlogin", body('email').not().isEmpty().withMessage('email Required'), body('password').not().isEmpty().withMessage('password Required'), adminauthcontroller.postlogin);
router.get("/getprofile", verifyToken, profilecontroller.getprofile);
router.post("/updateprofile", verifyToken, upload.single('image'), body('name').not().isEmpty().withMessage('name Required'), body('phone').not().isEmpty().withMessage('phone Required'), profilecontroller.updateprofile);
router.post("/changepassword", verifyToken, body('current_password').not().isEmpty().withMessage('current_password Required'),body('new_password').not().isEmpty().withMessage('new_password Required'),body('confirm_password').not().isEmpty().withMessage('confirm_password Required'), profilecontroller.updatepassword);

module.exports = router;