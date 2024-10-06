const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLogs.model');



const protect = async (req, res, next) => {
  let token;
  if (!req.cookies.token) {
    return res.json({ isAuthenticated: false, message: "Token not found in cookies" });
  }
  
  if (req.cookies && req.cookies.token) {
    console.log('ito Cookies:', req.cookies); 
    try {
      token = req.cookies.token;

      console.log('Token:', token); // Log the token for debugging

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('Decoded:', decoded); // Log the decoded payload for debugging

      // Find the user by ID and exclude the password hash
      req.user = await Admin.findById(decoded.id).select('-password_hash');

      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Authenticated User:', req.user); // Log the authenticated user

      next();
    } catch (error) {
      //console.error('Token verification failed:', error); // Log the error for debugging
      return res.json({ isAuthenticated: false, message: 'Not authorized, token failed' });
    }
  } else {
    console.log('Request Cookies:', req.cookies); // Log cookies
    return res.status(401).json({ isAuthenticated: false, message: 'Not authorized, no token' });
  }
};

// Log activity function
const logActivity = async (user, action, ipAddress, entityAffected, changes = '') => {
  try {
    const log = new ActivityLog({
      admin_id: user._id,
      role: user.role,
      action,
      entity_affected: entityAffected,
      ip_address: ipAddress, // Capture IP address
      changes,
    });
    await log.save();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { protect, logActivity };