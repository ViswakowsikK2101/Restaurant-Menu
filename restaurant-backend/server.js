const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Base route for testing
app.get('/', (req, res) => {
  res.send('Restaurant Backend API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
