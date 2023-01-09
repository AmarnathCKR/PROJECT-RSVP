
const mongoose = require("mongoose");

const Product = require("./productModel");

// creating objectSchema

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 5,
        max: 15,
        trim: true,
        required: true,
    },
   
    discount: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true,
    },

    originalPrice: {
        type: Number,
    },
    finalPrice: {
        type: Number,
    },
   
    expirationTime: {
        type: String,
        required: true,
    }},
    {timestamps: true}
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;