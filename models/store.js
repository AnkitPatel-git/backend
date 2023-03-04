const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const storeSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'users'
    },
    fundraisername: {
        type: String,
        required: true,
    },
    fundraisertype: {
        type: String,
        required: true,
    },
    noofsellers: {
        type: String,
        required: true,
    },
    nameofsellers: {
        type: String,
        required: false,
    },
    firstname: {
        type: String,
        required: false,
    },
    lastname: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    shippingaddress: {
        type: String,
        required: false,
    },
    zipcode: {
        type: String,
        required: false
    },
    fundraisedpreviously: {
        type: String,
        required: false
    },
    payouttype: {
        type: String,
        required: false
    },
    startdate: {
        type: Date,
        required: false
    },
    enddate: {
        type: Date,
        required: false
    },
    storedelete: {
        type: String,
        required: true,
        default: '0'
    },
    status: {
        type: String,
        required: true,
        default: 'Active'
    }
});

storeSchema.set('timestamps', true);
storeSchema.plugin(uniqueValidator);
module.exports = mongoose.model('store', storeSchema,'store');