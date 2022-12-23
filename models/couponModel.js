const mongoose = require("mongoose");


const couponSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  code: String,
  value : String,
  status : Boolean
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
