const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
    },
    
    status: {
        type: String,
        required: true,
        default: 'Active'
    }
});

categorySchema.set('timestamps', true);
categorySchema.plugin(uniqueValidator);
module.exports = mongoose.model('category',categorySchema,'category');