var express = require('express');
var router = express.Router();
var product= require('../../models/product');
var productimages= require('../../models/productimages');
var category= require('../../models/category');
var verifyToken = require('../../middleware/verifytokenadmin');
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

router.get('/list',verifyToken, async function(req, res, next){
  try{
        const data = await product.find().lean().populate('categoryId','category_name').exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/create',verifyToken,upload.fields([{ name: 'image', maxCount: 1 },{ name: 'images', maxCount: 3 }]), body('admincm').not().isEmpty().isLength({min:0,max:100}).withMessage('admincm Required'), body('product_name').not().isEmpty().withMessage('product_name Required'), body('categoryId').not().isEmpty().withMessage('categoryId Required'),body('productammount').not().isEmpty().withMessage('productammount Required'),body('quantity').not().isEmpty().withMessage('quantity Required'),  async function(req, res, next){
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const event = new Date();
            const datefolder = event.toDateString();
  try{
      var getData = await category.findOne({'_id':req.body.categoryId,status:"Active"},{_id: 1,banner: 1}).exec();
      if (!getData) {
      return res.status(400).json({ errors: "category Didn't Exist or blocked" });
    }
    if(typeof req.files.image === 'undefined'){
          bannerimg='';
        }else{
            
          bannerimg=`uploads/images/products/${datefolder}/${req.files.image[0].filename}`;
        }
        
        const add = new product({
                "producttitle":req.body.product_name,
                "categoryId":req.body.categoryId,
                "productammount":req.body.productammount,
                "quantity":req.body.quantity,
                "admincm":req.body.admincm,
                "customercm":(100 - (req.body.admincm)),
                 "image":bannerimg,
             
            });
            add.save(async function(err,result){
            if (err){
                    res.status(400).json({error: err})
            }else{
                if(req.files.images){
                        req.files.images.map((cv, ind, arr)=>{
                        req.files.images[ind].product_id=result._id;
                        req.files.images[ind].images=`uploads/images/products/${datefolder}/${arr[ind].filename}`;
                        });
                        productimages.insertMany(req.files.images);
                }

                return res.status(200).json({ success:'product Created', data:result });
            }
            });
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
        return res.status(200).json({ data:data, dataimages });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/update',verifyToken,upload.fields([{ name: 'image', maxCount: 1 },{ name: 'images', maxCount: 3 }]),body('admincm').not().isEmpty().isLength({min:0,max:100}).withMessage('admincm Required'), body('categoryId').not().isEmpty().withMessage('categoryId Required'), body('productId').not().isEmpty().withMessage('productId Required'),body('product_name').not().isEmpty().withMessage('product_name Required'), async function(req, res, next){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
     const event = new Date();
            const datefolder = event.toDateString();
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
        if(req.files.image){
          
          bannerimg=`uploads/images/products/${datefolder}/${req.files.image[0].filename}`;
          if(getData.image != '' && getData.image != null && getData.image != undefined){
            if (fs.existsSync(imageBaseDir+getData.image)) {
              fs.unlinkSync(imageBaseDir+getData.image);
            }
         }
        }else{
           
         bannerimg= getData.image;
        }
         const data = await product.findByIdAndUpdate(req.body.productId,{'producttitle':req.body.product_name,'categoryId':req.body.categoryId,'productammount':req.body.productammount,'status':"Active","quantity":req.body.quantity,'image':bannerimg,"admincm":req.body.admincm,"customercm":(100 - (req.body.admincm))}).exec();
         
        var getproduct = await productimages.find({'product_id':req.body.productId}).countDocuments();
        if(req.files.images ){
            if((getproduct + (req.files.images.length)) <=3){
            req.files.images.map((cv, ind, arr)=>{
            req.files.images[ind].product_id=req.body.productId;
            req.files.images[ind].images=`uploads/images/products/${datefolder}/${arr[ind].filename}`;
            });
            productimages.insertMany(req.files.images);
            }else{
                return res.status(200).json({ success:'product Updated But unabel to Add more Image, as Max count Reached' });
            }
        }
        
       
        return res.status(200).json({ success:'product Updated' });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/deleteimage/:id',verifyToken, async function(req, res, next){
    let dataId= req.params.id;
  try{
     await productimages.findByIdAndRemove(dataId).catch(err => {
     return res.status(500).json({ errors: err });
  });
  return res.status(200).json({ sucess:"Image Deleted" });
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