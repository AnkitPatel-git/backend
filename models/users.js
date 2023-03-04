const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Email = require('mongoose-type-mail');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user_type:{
        type: String,
        required: false
    },
    email: {
        type: Email,
        required: [true, 'email is required'],
        unique: [true, 'this email is already use'],
    },
    phone:{
        type: Number,
        required: [true, 'phone is required'],
        maxLength: 12,
        minLength: 8
    },
    total_amount:{
        type: Number,
        required: true,
        default: "0"
    },
    gender:{
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    postal_code: {
        type: Number,
        required: false,
    },
    email_verified_at: {
        type: Date,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    remember_token: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        default: "11"
    },
    image: {
        type: String,
        required: false
    },
    is_admin:{
        type: Number,
        required: true,
        default: "0"
    },
    login_status:{
        type: Number,
        required: true,
        default: "0"
    },
    status: {
        type: String,
        required: true,
        default: 'Active'
    }
});

UserSchema.set('timestamps', true);
UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('users',UserSchema,'users');