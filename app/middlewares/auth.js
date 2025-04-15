const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Add admin from payload to request
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 