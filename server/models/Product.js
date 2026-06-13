const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  rate: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    default: '📦'
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
