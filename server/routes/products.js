const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET: Fetch all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Server error fetching products.' });
  }
});

// POST: Add new product
router.post('/', async (req, res) => {
  const { name, rate, icon } = req.body;
  if (!name || isNaN(parseFloat(rate))) {
    return res.status(400).json({ message: 'Name and a valid numeric rate are required.' });
  }

  try {
    const existing = await Product.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A product with this name already exists.' });
    }

    const newProduct = new Product({
      name: name.trim(),
      rate: parseFloat(rate),
      icon: icon ? icon.trim() : '📦'
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully!', product: newProduct });
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ error: 'Server error creating product.' });
  }
});

// PUT: Update an existing product by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, rate, icon } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (name) {
      const existing = await Product.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'Another product with this name already exists.' });
      }
      product.name = name.trim();
    }
    
    if (rate !== undefined) {
      if (isNaN(parseFloat(rate))) {
        return res.status(400).json({ message: 'Invalid rate amount.' });
      }
      product.rate = parseFloat(rate);
    }
    
    if (icon) {
      product.icon = icon.trim();
    }

    await product.save();
    res.json({ message: 'Product updated successfully!', product });
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ error: 'Server error updating product.' });
  }
});

// DELETE: Remove product by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully!' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: 'Server error deleting product.' });
  }
});

module.exports = router;
