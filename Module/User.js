const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true,
    },
    role: {
        type: String
    },
    status: {
        type: String
    },
});

const User = mongoose.model('Users', UserSchema);
module.exports = User;