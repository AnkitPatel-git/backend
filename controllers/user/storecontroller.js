var express = require('express');
var router = express.Router();
var storemodel= require('../../models/store');
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

router.get('/list',verifyToken, async function(req, res, next){
  try{
        const data = await storemodel.find({'user_id':req.decoded.id,'storedelete':0}).limit(1).exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/create',verifyToken, body('enddate').not().isEmpty().withMessage('enddate Required'),body('startdate').not().isEmpty().withMessage('startdate Required'),body('payouttype').not().isEmpty().withMessage('payouttype Required'),body('fundraisedpreviously').not().isEmpty().withMessage('fundraisedpreviously Required'),body('zipcode').not().isEmpty().withMessage('zipcode Required'),body('shippingaddress').not().isEmpty().withMessage('shippingaddress Required'),body('phone').not().isEmpty().withMessage('phone Required'),body('email').not().isEmpty().withMessage('email Required'),body('lastname').not().isEmpty().withMessage('lastname Required'),body('firstname').not().isEmpty().withMessage('firstname Required'),body('noofsellers').not().isEmpty().withMessage('noofsellers Required'), body('fundraisertype').not().isEmpty().withMessage('fundraisertype Required'), body('fundraisername').not().isEmpty().withMessage('fundraisername Required'),  async function(req, res, next){
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
      var getData = await storemodel.exists({'user_id':req.decoded.id,'storedelete':0}).exec();
      console.log(getData);
      if (getData !== null) {
      return res.status(400).json({ errors: "You already have An Store Active" });
      }
        const add = new storemodel({
                "user_id":req.decoded.id,
                "fundraisername":req.body.fundraisername,
                "fundraisertype":req.body.fundraisertype,
                "noofsellers":req.body.noofsellers,
                "nameofsellers":req.body.nameofsellers,
                "firstname":req.body.firstname,
                "lastname":req.body.lastname,
                "email":req.body.email,
                "phone":req.body.phone,
                "shippingaddress":req.body.shippingaddress,
                "zipcode":req.body.zipcode,
                "fundraisedpreviously":req.body.fundraisedpreviously,
                "payouttype":req.body.payouttype,
                "startdate":req.body.startdate,
                "enddate":req.body.enddate,
            });
            add.save(function(err,result){
            if (err){
                    res.status(400).json({error: err})
            }else{
                return res.status(200).json({ success:'Store Created', data:result });
            }
            });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});

router.get('/show/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
        const data = await storemodel.findOne({'_id':dataId,'storedelete':0}).exec();
        return res.status(200).json({ data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/update/:id',verifyToken, body('enddate').not().isEmpty().withMessage('enddate Required'),body('startdate').not().isEmpty().withMessage('startdate Required'),body('payouttype').not().isEmpty().withMessage('payouttype Required'),body('fundraisedpreviously').not().isEmpty().withMessage('fundraisedpreviously Required'),body('zipcode').not().isEmpty().withMessage('zipcode Required'),body('shippingaddress').not().isEmpty().withMessage('shippingaddress Required'),body('phone').not().isEmpty().withMessage('phone Required'),body('email').not().isEmpty().withMessage('email Required'),body('lastname').not().isEmpty().withMessage('lastname Required'),body('firstname').not().isEmpty().withMessage('firstname Required'),body('noofsellers').not().isEmpty().withMessage('noofsellers Required'), body('fundraisertype').not().isEmpty().withMessage('fundraisertype Required'), body('fundraisername').not().isEmpty().withMessage('fundraisername Required'),  async function(req, res, next){
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let dataId= req.params.id;
  try{
      var getData = await storemodel.exists({'user_id':req.decoded.id,'_id':dataId}).exec();

      if (!getData) {
      return res.status(400).json({ errors: "Store Not Found" });
      }
        const data = await storemodel.findByIdAndUpdate(dataId,{
                "fundraisername":req.body.fundraisername,
                "fundraisertype":req.body.fundraisertype,
                "noofsellers":req.body.noofsellers,
                "nameofsellers":req.body.nameofsellers,
                "firstname":req.body.firstname,
                "lastname":req.body.lastname,
                "email":req.body.email,
                "phone":req.body.phone,
                "shippingaddress":req.body.shippingaddress,
                "zipcode":req.body.zipcode,
                "fundraisedpreviously":req.body.fundraisedpreviously,
                "payouttype":req.body.payouttype,
                "startdate":req.body.startdate,
                "enddate":req.body.enddate,
            });
            return res.status(200).json({ success:'Store Updated',data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/edit/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
       const viewDatas= await storemodel.findOne({'_id':dataId},{'status':1}).exec();
    if(viewDatas){
      var statusKey= viewDatas.status;
      var newStatusKey='';
      if(statusKey == 'Active'){
        newStatusKey= 'Deactive';
      }else{
        newStatusKey= 'Active';
      }
       await storemodel.findOneAndUpdate({'_id':dataId}, {'status':newStatusKey});
    }
    return res.status(200).json({ sucess:"Status Changed" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});

router.get('/delete/:id',verifyToken, async function(req, res, next){
    let dataId= req.params.id;
  try{
     await storemodel.findOneAndUpdate({'_id':dataId,'storedelete':0}, {'storedelete':1}).catch(err => {
     return res.status(500).json({ errors: err });
  });
  return res.status(200).json({ sucess:"Store Deleted" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});


module.exports = router;