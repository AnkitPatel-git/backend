var users= require('../../models/users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');

exports.getprofile = async (req, res, next) => {
    try{
        const data= await users.findOne({_id:req.decoded.id},{name:1,email:1,phone:1,image:1}).exec();
        return res.status(200).json({ success: 'Data Found', data:data });
      }catch(err){
        return res.status(500).json({ errors: err });
      }
};
exports.updateprofile = async (req, res, next) => {
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
        await users.findByIdAndUpdate(req.decoded.id,{ 'name':req.body.name ,'phone':parseInt(req.body.phone),'image':profileimg }).exec();
        return res.status(200).json({ success: 'Profile Updated' });
    }catch(err){
        return res.status(500).json({ errors: err });
    }
};

exports.updatepassword = async (req, res, next) => {
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
};