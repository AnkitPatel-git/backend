var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var product= require('../../models/product');
var category= require('../../models/category');
var storemodel= require('../../models/store');
var users= require('../../models/users');
let verifyToken = require('../../middleware/verifytokenadmin');

router.get('/',verifyToken, async function(req, res, next){
  try{
        var data ={};
            data.products = await product.find().countDocuments();
            data.categorys = await category.find().countDocuments();
            data.stores = await storemodel.find().countDocuments();
            data.users = await users.find({'is_admin':0,'status':"Active"}).countDocuments();
        return res.status(200).json({ success:'Data found',data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});

module.exports = router;