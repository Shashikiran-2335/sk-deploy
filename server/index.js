const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const borrowRoutes = require('./routes/borrow');
const productRoutes = require('./routes/products');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('✅ MongoDB connected');
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const defaults = [
                { name: 'Milk', rate: 30, icon: '🥛' },
                { name: 'Bread', rate: 40, icon: '🍞' },
                { name: 'Eggs (1 Dozen)', rate: 80, icon: '🥚' },
                { name: 'Sugar (1 kg)', rate: 45, icon: '🍬' },
                { name: 'Rice (1 kg)', rate: 60, icon: '🌾' },
                { name: 'Cooking Oil (1 L)', rate: 140, icon: '🧴' },
                { name: 'Tea Powder (250g)', rate: 70, icon: '☕' },
                { name: 'Wheat Flour (5 kg)', rate: 220, icon: '🌾' },
                { name: 'Salt (1 kg)', rate: 20, icon: '🧂' },
                { name: 'Soap', rate: 25, icon: '🧼' },
                { name: 'Biscuits', rate: 15, icon: '🍪' }
            ];
            await Product.insertMany(defaults);
            console.log('🌱 Default products seeded successfully!');
        }
    } catch (seedErr) {
        console.error('❌ Failed to seed database products:', seedErr);
    }
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/borrow', borrowRoutes);
app.use('/borrow', borrowRoutes);
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
