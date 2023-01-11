const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    product: [{
      productId : {
        type: mongoose.Types.ObjectId,
        
        ref: 'Product'
      },

      qtyItems : Number
    }],

    address: [
      {
        fullAddress: String,
        contact : String,
        name: String,
        pincode: String,
      },
    ],
    coupon: String,
    Totalprice: Number,
    finalPrice: Number,
    discount : Number,
    orderType : String,
    status: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
