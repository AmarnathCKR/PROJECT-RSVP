const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image: String,
  status : Boolean
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
