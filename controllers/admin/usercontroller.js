var express = require('express');
var router = express.Router();
var users= require('../../models/users');
var bank= require('../../models/bank');
var verifyToken = require('../../middleware/verifytokenadmin');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/list',verifyToken, async function(req, res, next){
  try{
        const data = await users.find({'is_admin':0},{'name':1,'email':1,'phone':1,'createdAt':1,'status':1}).exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/create',verifyToken, body('name').not().isEmpty().withMessage('name Required'), body('phone').not().isEmpty().withMessage('phone Required'),body('email').not().isEmpty().withMessage('email Required'), body('password').not().isEmpty().withMessage('password Required'), async function(req, res, next){
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
            add.save(function(err,result){
            if (err){
                    res.status(400).json({error: err})
            }else{
                return res.status(200).json({ success:'User Created', data:result });
            }
            });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/show/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
        const data = await users.findOne({'_id':dataId},{'name':1,'email':1,'phone':1,'createdAt':1,'status':1}).exec();
        return res.status(200).json({ data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/update',verifyToken, async function(req, res, next){
  try{
        const data = await users.find({'is_admin':0},{'name':1,'email':1,'phone':1,'createdAt':1,'status':1}).exec();
        return res.status(200).json({ data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/edit/:id',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
       const viewDatas= await users.findOne({'_id':dataId},{'status':1}).exec();
    if(viewDatas){
      var statusKey= viewDatas.status;
      var newStatusKey='';
      if(statusKey == 'Active'){
        newStatusKey= 'Deactive';
      }else{
        newStatusKey= 'Active';
      }
       await users.findOneAndUpdate({'_id':dataId}, {'status':newStatusKey,'remember_token':"Status changed"});
    }
    return res.status(200).json({ sucess:"Status Changed" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/banklist',verifyToken, async function(req, res, next){
  try{
        const data = await bank.find().populate('user_id','name').exec();
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});


module.exports = router;