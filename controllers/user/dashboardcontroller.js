var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var product= require('../../models/product');
var category= require('../../models/category');
var notification= require('../../models/notification');
var verifyToken = require('../../middleware/verifytokenuser');

router.get('/',verifyToken, async function(req, res, next){
  try{
        var data ={};
            data.products = await product.find().countDocuments();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/notification',verifyToken, async function(req, res, next){
  try{
    //   const add = new notification({
    //             "user_id":req.decoded.id,
    //             "user_type":"Fundraiser",
    //             "module":"notification",
    //             "message":"testing",
    //         });
    //         add.save();
        var data = await notification.find({'user_id':req.decoded.id});
        var totalunread =await notification.find({'user_id':req.decoded.id,'read_status':"UnRead"}).countDocuments();
        return res.status(200).json({ success:'Data found', data:data,totalunread });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/notification_read/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{

    await notification.findOneAndUpdate({'_id':dataId}, {'read_status':"Read"});
    return res.status(200).json({ sucess:"Status Changed" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});

module.exports = router;