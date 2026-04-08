// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); // load .env variables once

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const foodRoutes = require('./src/routes/foodRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');


const app = express();

// Middleware (note the parentheses)
// Allow your frontend URL (replace with your actual frontend URL)
const allowedOrigins = [
    'https://food-delivery-frontend-app-production.up.railway.app',
    'http://localhost:5173' // for local testing
];

app.use(cors({
  origin: allowedOrigins, // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json());

// const fs = require('fs');
// const uploadDir = 'uploads';
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));