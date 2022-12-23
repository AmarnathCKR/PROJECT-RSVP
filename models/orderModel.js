const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const orderSchema = new mongoose.Schema({
 
  orderId :String,

  product: String,
  coupon : String,
  price : String,
  quantity : Number,
  status : Boolean,
  user : String

});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
