var express = require('express');
var router = express.Router();
var product= require('../../models/product');
var storeproduct =require('../../models/storeproduct');
var productimages= require('../../models/productimages');
var storemodel= require('../../models/store');
var category= require('../../models/category');
var verifyToken = require('../../middleware/verifytokenuser');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
// multer start

const multer = require("multer");
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
     const event = new Date();
    const datefolder = event.toDateString();
    const dest = imageBaseDir+'uploads/images/products/'+datefolder;
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

router.get('/newlist',verifyToken, async function(req, res, next){
  try{
      var getData = await storemodel.findOne({'user_id':req.decoded.id,'storedelete':0}).exec();

      if (!getData) {
      return res.status(200).json({ errors: "You didnt have An Store Active" });
      }
        const data = await product.find().lean().populate('categoryId','category_name').exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/list',verifyToken, async function(req, res, next){
  try{
      var getData = await storemodel.findOne({'user_id':req.decoded.id,'storedelete':0}).exec();
      if (!getData) {
      return res.status(200).json({ errors: "You didnt have An Store Active" });
      }
      var getstoreproductData = await storeproduct.find({'store_id':getData._id}).distinct('product_id');
      console.log(getstoreproductData);
        const data = await product.find({'_id': {$in: getstoreproductData}}).lean().populate('categoryId','category_name').exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/productforstore/:id',verifyToken, async function(req, res, next){
    let dataId= req.params.id;
  try{
      var getData = await storemodel.findOne({'user_id':req.decoded.id,'storedelete':0}).exec();

      if (!getData) {
      return res.status(200).json({ errors: "You didnt have An Store Active" });
      }
      var getstoreproductData = await storeproduct.find({'store_id':dataId}).distinct('product_id');
      console.log(getstoreproductData);
        const data = await product.find({'_id': {$nin: getstoreproductData}}).lean().populate('categoryId','category_name').exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/addproduct',verifyToken, body('product_id').not().isEmpty().withMessage('product_id Required'),body('store_id').not().isEmpty().withMessage('store_id Required'),  async function(req, res, next){
    console.log(req.body);
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body.product_id);
  try{
      var getData = await storemodel.findOne({'_id':req.body.store_id,status:"Active"},{_id: 1,banner: 1}).exec();
      if (!getData) {
      return res.status(400).json({ errors: "Store Didn't Exist or blocked" });
        }

         storeproduct.create({
                "product_id":req.body.product_id,
                "store_id":req.body.store_id,
    
       });
         return res.status(200).json({ success:'Product Added'}); 
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/remove/:id',verifyToken, async function(req, res, next){
    let dataId= req.params.id;
  try{
      var getData = await storemodel.findOne({'user_id':req.decoded.id,'storedelete':0}).exec();
      if (!getData) {
      return res.status(200).json({ errors: "You didnt have An Store Active" });
      }
      var getstoreproductData = await storeproduct.findOneAndRemove({'store_id':getData._id,'product_id':dataId});
        return res.status(200).json({ success:'Product Removed' });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/show/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
        const data = await product.findOne({'_id':dataId}).lean().exec();
        const dataimages = await productimages.find({'product_id':dataId}).exec();
         const userdata = await category.findOne({'_id':data.categoryId},{'category_name':1}).exec();
        data["category_name"] = userdata.category_name;
        return res.status(200).json({ data:data, dataimages:dataimages});
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/update',verifyToken,upload.single('image'),body('categoryId').not().isEmpty().withMessage('categoryId Required'), body('productId').not().isEmpty().withMessage('productId Required'),body('product_name').not().isEmpty().withMessage('product_name Required'), async function(req, res, next){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
      console.log(req.body);
      var catgetData = await category.findOne({'_id':req.body.categoryId,status:"Active"},{_id: 1,banner: 1}).exec();
      console.log(catgetData);
      if (!catgetData) {
      return res.status(400).json({ errors: "category Didn't Exist or blocked" });
    }
      var getData = await product.findOne({'_id':req.body.productId},{_id: 1,image: 1}).exec();
      if (!getData) {
      return res.status(400).json({ errors: "Product Didn't Exist or Deleted" });
    }
        if(typeof req.file === 'undefined'){
          bannerimg= getData.image;
        }else{
            const event = new Date();
            const datefolder = event.toDateString();
          bannerimg=`uploads/images/products/${datefolder}/${req.file.filename}`;
          if(getData.image != '' && getData.image != null && getData.image != undefined){
            if (fs.existsSync(imageBaseDir+getData.image)) {
              fs.unlinkSync(imageBaseDir+getData.image);
            }
         }
        }
        const data = await product.findByIdAndUpdate(req.body.productId,{'producttitle':req.body.product_name,'categoryId':req.body.categoryId,'productammount':req.body.productammount,'status':"Active",'image':bannerimg}).exec();
        return res.status(200).json({ success:'product Updated' });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/edit/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
       const viewDatas= await product.findOne({'_id':dataId},{'status':1}).exec();
    if(viewDatas){
      var statusKey= viewDatas.status;
      var newStatusKey='';
      if(statusKey == 'Active'){
        newStatusKey= 'Deactive';
      }else{
        newStatusKey= 'Active';
      }
       await product.findOneAndUpdate({'_id':dataId}, {'status':newStatusKey});
    }
    return res.status(200).json({ sucess:"Status Changed" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});

router.get('/delete/:id',verifyToken, async function(req, res, next){
    let dataId= req.params.id;
  try{
     await product.findByIdAndRemove(dataId).catch(err => {
     return res.status(500).json({ errors: err });
  });
  return res.status(200).json({ sucess:"Product Deleted" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});


module.exports = router;