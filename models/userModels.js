const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    required: true
  },

  address : [{
    name : String,
    contact : String,
    fullAddress : String,
    stat : Boolean,
    pincode : String

  }]


});


const User = mongoose.model('User', UserSchema);

module.exports = User;
