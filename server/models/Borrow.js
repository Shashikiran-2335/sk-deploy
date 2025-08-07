const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: String,
  quantity: Number,
  rate: Number,
});

const borrowSchema = new mongoose.Schema({
  customerName: String,
  date: String,
  items: [itemSchema],
  totalCost: Number,
});

const Borrow = mongoose.model('Borrow', borrowSchema);

module.exports = Borrow;
