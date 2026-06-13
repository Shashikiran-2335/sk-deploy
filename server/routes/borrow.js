const express = require('express');
const router = express.Router();
const Borrow = require('../models/Borrow');

// POST: Add new borrow entry
router.post('/', async (req, res) => {
  try {
    const newBorrow = new Borrow(req.body);
    await newBorrow.save();
    res.status(201).json({ message: 'Borrow entry saved successfully!' });
  } catch (error) {
    console.error('Error saving borrow entry:', error.message);
    res.status(500).json({ error: 'Server error saving borrow entry.' });
  }
});

// GET: Fetch all borrow entries
router.get('/', async (req, res) => {
  try {
    const entries = await Borrow.find();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching entries" });
  }
});
const mongoose = require('mongoose');
// DELETE: Remove a borrow entry by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deleted = await Borrow.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Borrow entry not found' });
    }
    res.json({ message: 'Borrow entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting borrow entry:', err.message);
    res.status(500).json({ message: 'Server error deleting entry' });
  }
});

// PATCH: Toggle or set status (paid / unpaid)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const entry = await Borrow.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Borrow entry not found' });
    }

    if (status) {
      entry.status = status;
    } else {
      entry.status = entry.status === 'paid' ? 'unpaid' : 'paid';
    }

    await entry.save();
    res.json({ message: `Status updated to ${entry.status}`, entry });
  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// GET: Unique customer names (supports both /customers and /borrow/customers)
const getCustomersList = async (req, res) => {
  try {
    const customers = await Borrow.distinct('customerName');
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

router.get('/customers', getCustomersList);
router.get('/borrow/customers', getCustomersList);

module.exports = router;
