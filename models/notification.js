const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: false,
    },
    user_type: {
        type: String,
        required: false,
    },
    module: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: false,
    },
    read_status: {
        type: String,
        required: true,
        default: "UnRead"
    },
    type: {
        type: Number,
        required: true,
        default: 1
    },
});

notificationSchema.set('timestamps', true);
notificationSchema.plugin(uniqueValidator);
module.exports = mongoose.model('notification',notificationSchema,'notification');