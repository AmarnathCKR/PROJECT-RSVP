const razorpay=require("razorpay")
require('dotenv').config()

const instance = new razorpay({
    key_id: 'rzp_test_sUDKggaDF9cOmw',
    key_secret: 'v4yYwIjiXpfWB484WE2Vff4i',
  });
  
  module.exports = instance;