var express = require('express');
var router = express.Router();
var category= require('../../models/category');
var verifyToken = require('../../middleware/verifytokenadmin');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
// multer start

const multer = require("multer");
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = imageBaseDir+'uploads/images/categorys/';
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
        const data = await category.find().exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/create',verifyToken, upload.none(), body('category_name').not().isEmpty().withMessage('category_name Required'),  async function(req, res, next){
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
        
        const add = new category({
                "category_name":req.body.category_name,
                
            });
            add.save(function(err,result){
            if (err){
                    res.status(400).json({error: err})
            }else{
                return res.status(200).json({ success:'Category Created', data:result });
            }
            });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/show/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
        const data = await category.findOne({'_id':dataId}).exec();
        return res.status(200).json({ data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/update',verifyToken, upload.none(), body('categoryId').not().isEmpty().withMessage('categoryId Required'),body('category_name').not().isEmpty().withMessage('category_name Required'), async function(req, res, next){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
      var getData = await category.findOne({'_id':req.body.categoryId},{_id: 1,banner: 1}).exec();
      if (!getData) {
      return res.status(400).json({ errors: "category Didn't Exist " });
    }
        
        const data = await category.findByIdAndUpdate(req.body.categoryId,{'category_name':req.body.category_name,'status':'Active'}).exec();
        return res.status(200).json({ success:'Category Updated' });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/edit/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
       const viewDatas= await category.findOne({'_id':dataId},{'status':1}).exec();
    if(viewDatas){
      var statusKey= viewDatas.status;
      var newStatusKey='';
      if(statusKey == 'Active'){
        newStatusKey= 'Deactive';
      }else{
        newStatusKey= 'Active';
      }
       await category.findOneAndUpdate({'_id':dataId}, {'status':newStatusKey});
    }
    return res.status(200).json({ sucess:"Status Changed" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});


module.exports = router;