const express = require('express');
const router = express.Router();

// @route   GET api/users
// @desc    Test route
// @access  Public
router.get('/', (req, res) => {
  res.json({ 
    message: 'Users API is working',
    success: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 