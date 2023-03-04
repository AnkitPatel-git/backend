const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const bankSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'users'
    },
    accountholdername: {
        type: String,
        required: true,
    },
    accountnumber: {
        type: String,
        required: true,
    },
    bankname: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Active'
    },
});

bankSchema.set('timestamps', true);
bankSchema.plugin(uniqueValidator);
module.exports = mongoose.model('bank', bankSchema,'bank');