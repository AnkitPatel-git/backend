const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const storeproductSchema = new mongoose.Schema({
    
    product_id: {
        type: String,
        required: true,
    },
    store_id: {
        type: String,
        required: true,
    },
});

storeproductSchema.set('timestamps', true);
storeproductSchema.plugin(uniqueValidator);
module.exports = mongoose.model('storeproduct', storeproductSchema,'storeproduct');