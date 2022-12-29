const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Category = require("./categoryModel")

const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  model :String,

  image: Array,
  category :{
    type : mongoose.Types.ObjectId,
    ref : Category,
    required: true,
  },

  price : String,
  description : String,
  color : String,
  stock : Number,
  status : Boolean

});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
