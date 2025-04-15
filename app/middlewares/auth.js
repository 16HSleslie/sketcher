const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function(req, res, next) {
  // Get token from header or query params or cookie
  const token = req.header('x-auth-token') || req.query.token || (req.cookies && req.cookies['auth-token']);

  // Log the token for debugging
  console.log('Auth middleware called, token:', token ? `${token.substring(0, 15)}...` : 'No token');

  // Check if no token
  if (!token) {
    console.log('Auth failed: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Remove token rejection to allow all tokens to be verified
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('Token verified for:', decoded.admin ? 'admin' : 'user');

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
    console.log('Auth failed: Invalid token -', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 