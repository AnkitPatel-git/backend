var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { body, validationResult } = require('express-validator');
var verifyToken = require('../../middleware/verifytokenuser');
var users = require('../../models/users');
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

router.post('/postlogin', body('email').not().isEmpty().withMessage('email Required'), body('password').not().isEmpty().withMessage('password Required'), async function(req, res, next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }
    let userdata = {
    username: req.body.email,
    password: req.body.password,
    };
    const user = await users.findOne({email:userdata.username},{_id: 1,password:1, status:1,name:1}).where({'is_admin':0}).exec();
    if(!user){
        res.status(500).json({
        message: 'Login Failed, Invalid Email or Invalid Password'
        });
    }else{
    const match = await bcrypt.compare(userdata.password, user.password);
    if(match){
        if(user.status =='Active'){
            let token = jwt.sign({ id: user._id,name: user.name}, global.config.usersecretKey, {
            algorithm: global.config.algorithm,
            expiresIn: '7d'
            });
            const updateData= await users.findOneAndUpdate({'_id':user._id}, {'remember_token':token,});
            res.status(200).json({
            message: 'Login Successful',
            jwtoken: token,
            data:user
            });
        } else {
            res.status(500).json({
            message: 'Login Failed, User Blocked'
            });
        }
    }else {
    res.status(500).json({
    message: 'Login Failed, Invalid Password'
    });
    }}
 });
 router.post('/postsignup', body('name').not().isEmpty().withMessage('name Required'), body('phone').not().isEmpty().withMessage('phone Required'),body('email').not().isEmpty().withMessage('email Required'), body('password').not().isEmpty().withMessage('password Required'), async function(req, res, next){
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
        const hash =await bcrypt.hashSync(req.body.password, saltRounds);
        const add = new users({
                "name":req.body.name,
                "user_type":"Fundraiser",
                "email":req.body.email,
                "phone":req.body.phone,
                "password":hash,
            });
            add.save(async function(err,result){
            if (err){
                    res.status(400).json({error: err});
            }else{
                let token = jwt.sign({ id: result._id,name: result.name}, global.config.usersecretKey, {algorithm: global.config.algorithm,expiresIn: '7d'});
                const updateData= await users.findOneAndUpdate({'_id':result._id}, {'remember_token':token,});
                return res.status(200).json({message: 'Login Successful',jwtoken: token,data:result});
              
            }
            });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
 
router.get('/getprofile',verifyToken, async function(req, res, next){
    try{
        const data= await users.findOne({_id:req.decoded.id},{name:1,email:1,phone:1,image:1}).exec();
        
        return res.status(200).json({ success: 'Data Found', data:data });
      }catch(err){
        return res.status(500).json({ errors: err });
      }
});
router.post('/changepassword',verifyToken, body('current_password').not().isEmpty().withMessage('current_password Required'),body('new_password').not().isEmpty().withMessage('new_password Required'),body('confirm_password').not().isEmpty().withMessage('confirm_password Required'), async function(req, res, next){
            const errors = validationResult(req);
        if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
        }
    try{
        if (req.body.new_password !== req.body.confirm_password ) {
         return res.status(400).json({ errors: "password mimatch" });
        }
        const data= await users.findOne({_id:req.decoded.id},{name:1,password:1}).exec();
        const match = await bcrypt.compare(req.body.current_password, data.password);
        if(match){
            const hash =await bcrypt.hashSync(req.body.new_password, saltRounds);
            await users.findByIdAndUpdate(req.decoded.id,{ 'password':hash}).exec();
        return res.status(200).json({ success: 'Password Updated' });
        }
        return res.status(200).json({ error: 'Password mismatch'});
      }catch(err){
        return res.status(500).json({ errors: err });
      }
});
router.post('/updateprofile',verifyToken, upload.single('profile'), body('name').not().isEmpty().withMessage('name Required'), body('phone').not().isEmpty().withMessage('phone Required'), async function(req, res, next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
        var getData = await users.findOne({'_id':req.decoded.id},{_id: 1,image: 1}).exec();
        if(typeof req.file === 'undefined'){
          profileimg= getData.image;
        }else{
          profileimg=`uploads/images/profile/${req.file.filename}`
          if(getData.image != '' && getData.image != null && getData.image != undefined){
            if (fs.existsSync(imageBaseDir+getData.image)) {
              fs.unlinkSync(imageBaseDir+getData.image);
            }
         }
        }
        await users.findByIdAndUpdate(req.decoded.id,{ 'name':req.body.name ,'phone':req.body.phone,'image':profileimg }).exec();
        return res.status(200).json({ success: 'Profile Updated' });
    }catch(err){
        return res.status(500).json({ errors: err });
    }
});
 
 
module.exports = router;