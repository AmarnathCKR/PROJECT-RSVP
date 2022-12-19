const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const productSchema = new mongoose.Schema({
  name: {
    type: String
  },
  category: {
    type: String
  },
  image: {
    type: String
  },
  inStock: {
    type: Number
  },
  status: {
    type: Boolean
  },
  description: {
    type: String
  }

});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
