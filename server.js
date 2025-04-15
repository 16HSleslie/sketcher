const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'x-auth-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection - Only connect if not being required for tests
if (!module.parent) {
  mongoose.connect(config.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));
}

// Routes
app.use('/api/users', require('./app/routes/users'));
app.use('/api/products', require('./app/routes/products'));
app.use('/api/orders', require('./app/routes/orders'));
app.use('/api/admin', require('./app/routes/admin'));
app.use('/api/uploads', require('./app/routes/uploads'));

// API error handler
app.use('/api', (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server Error',
    error: config.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back the Angular index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start server if not being required by another module (for testing)
if (!module.parent) {
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
}

// Export app for testing
module.exports = app; 