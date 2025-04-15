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

    // Add admin and user from payload to request
    // This handles both admin and user tokens for broader compatibility
    if (decoded.admin) {
      req.admin = decoded.admin;
      // Also set user for compatibility with code that expects req.user
      req.user = { id: decoded.admin.id };
    } else if (decoded.user) {
      req.user = decoded.user;
      // Also set admin for compatibility with code that expects req.admin
      req.admin = { id: decoded.user.id };
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 