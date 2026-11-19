const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'stayeasy_secret_key_12345'
      );

      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const { inMemoryUsers } = require('../controllers/authController');
        req.user = (inMemoryUsers && inMemoryUsers.find((u) => u._id === decoded.id)) || {
          _id: decoded.id,
          role: 'guest',
          name: 'Guest'
        };
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied: unauthorized role'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
