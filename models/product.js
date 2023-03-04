const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const productSchema = new mongoose.Schema({
    producttitle: {
        type: String,
        required: true,
    },
    categoryId: {
        type: String,
        required: false,
        ref: 'category'
    },
    quantity: {
        type: Number,
        required: true,
        default: '500'
    },
    admincm:{
        type: Number,
        required: true,
        default: '0'
    },
    customercm:{
        type: Number,
        required: true,
        default: '0'
    },
    productammount: {
        type: Number,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true,
        default: 'Active'
    }
});

productSchema.set('timestamps', true);
productSchema.plugin(uniqueValidator);
module.exports = mongoose.model('product', productSchema,'product');