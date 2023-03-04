var express = require('express');
var router = express.Router();
var users= require('../../models/users');
var bank= require('../../models/bank');
var verifyToken = require('../../middleware/verifytokenuser');
const { body, validationResult } = require('express-validator');

router.get('/list',verifyToken, async function(req, res, next){
  try{
        const data = await bank.find({'user_id':req.decoded.id}).limit(1).exec();
        if(!data){
            return res.status(200).json({ success:'Add Account', });
        }
        return res.status(200).json({ success:'Data found', data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/create',verifyToken, body('accountholdername').not().isEmpty().withMessage('accountholdername Required'),body('accountnumber').not().isEmpty().withMessage('accountnumber Required'), body('bankname').not().isEmpty().withMessage('bankname Required'), async function(req, res, next){
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
      var getData = await bank.exists({'user_id':req.decoded.id}).exec();
      console.log(getData);
      if (getData !== null) {
      return res.status(400).json({ errors: "You already have An Bank Account" });
      }

        const userbank = new bank({
                "user_id":req.decoded.id,
                "accountholdername":req.body.accountholdername,
                "accountnumber":req.body.accountnumber,
                "bankname":req.body.bankname,
            });
            userbank.save(function(err,result){
            if (err){
                    res.status(400).json({error: err})
            }else{
                return res.status(200).json({ success:'Bank Account Added', data:result });
            }
            });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/show',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
        const data = await bank.findOne({'user_id':req.decoded.id}).exec();
        return res.status(200).json({ data:data });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.post('/update',verifyToken,body('accountholdername').not().isEmpty().withMessage('accountholdername Required'),body('accountnumber').not().isEmpty().withMessage('accountnumber Required'), body('bankname').not().isEmpty().withMessage('bankname Required'), async function(req, res, next){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
      console.log(req.body);
      var catgetData = await bank.findOne({'user_id':req.decoded.id}).exec();
      if (!catgetData) {
      return res.status(400).json({ errors: "Bank Detail Exist" });
    }
const data = await bank.findOneAndUpdate({'user_id':req.decoded.id},{"accountholdername":req.body.accountholdername, "accountnumber":req.body.accountnumber,"bankname":req.body.bankname,}).exec();
        return res.status(200).json({ success:'Detail Updated' });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
router.get('/edit',verifyToken, async function(req, res, next){
        let dataId= req.params.id;
  try{
       const viewDatas= await bank.findOne({'user_id':req.decoded.id},{'status':1}).exec();
    if(viewDatas){
      var statusKey= viewDatas.status;
      var newStatusKey='';
      if(statusKey == 'Active'){
        newStatusKey= 'Deactive';
      }else{
        newStatusKey= 'Active';
      }
       await bank.findOneAndUpdate({'user_id':req.decoded.id}, {'status':newStatusKey});
    }
    return res.status(200).json({ sucess:"Status Changed" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});

router.get('/delete',verifyToken, async function(req, res, next){
    let dataId= req.params.id;
  try{
     await bank.findOneAndRemove({'user_id':req.decoded.id}).catch(err => {
     return res.status(500).json({ errors: err });
  });
  return res.status(200).json({ sucess:"Details Deleted" });
  }catch(err){
    return res.status(500).json({ errors: err });
  }
});
module.exports = router;