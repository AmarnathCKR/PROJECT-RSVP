const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  model :String,

  image: String,
  category : String,
  price : String,
  description : String,
  color : String,
  stock : Number,
  status : Boolean

});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
