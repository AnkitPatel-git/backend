var express = require('express');
var router = express.Router();
var storemodel= require('../../models/store');
var users= require('../../models/users');
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
        const data = await storemodel.find({'storedelete':0}).populate('user_id','name').exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/show/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
        const data = await storemodel.findOne({'_id':dataId}).lean();
        const userdata = await users.findOne({'_id':data.user_id},{'name':1}).exec();
        data["username"] = userdata.name;
        
        return res.status(200).json({ data:data });
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