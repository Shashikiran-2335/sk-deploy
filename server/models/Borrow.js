const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: String,
  quantity: Number,
  rate: Number,
});

const borrowSchema = new mongoose.Schema({
  customerName: String,
  date: String,
  time: String,
  pickedUpBy: String,
  items: [itemSchema],
  totalCost: Number,
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  }
});

const Borrow = mongoose.model('Borrow', borrowSchema);

module.exports = Borrow;
