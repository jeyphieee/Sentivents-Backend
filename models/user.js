const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: '' 
    },
    organization: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    course: {
        type: String,
        default: ''
    },
    section: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);


// {   "name": "",
//     "email": "",
//     "passwordHash": "password",
//     "phone": "0999992123",
//     "isAdmin": true,
//     "street": "champaca st",
//     "apartment": "champaca apartment",
//     "zip": "1630",
//     "city": "Taguig city",
//     "country": "Philippines",
// }
