const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const productimagesSchema = new mongoose.Schema({
    
    product_id: {
        type: String,
        required: true,
    },
    images: {
        type: String,
        required: true,
    },
});

productimagesSchema.set('timestamps', true);
productimagesSchema.plugin(uniqueValidator);
module.exports = mongoose.model('productimages', productimagesSchema,'productimages');