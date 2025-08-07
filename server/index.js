const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const borrowRoutes = require('./routes/borrow');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/borrowdatabase')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/borrow', borrowRoutes);
app.use('/api/borrow/customers', borrowRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
