const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { logger } = require('../services/loggerService');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const authController = {
  // Register new user
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password,
        name
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      // Log successful registration
      logger.info(`New user registered: ${user._id}`);

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Log failed login attempt
        logger.warn(`Failed login attempt for email: ${email}`);
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Log successful login
      logger.info(`User logged in: ${user._id}`);

      res.json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const allowedUpdates = ['name', 'email'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      if (updates.email) {
        updates.email = updates.email.toLowerCase();
        
        // Check if email is already taken
        const existingUser = await User.findOne({ 
          email: updates.email,
          _id: { $ne: req.user._id }
        });
        
        if (existingUser) {
          throw new AppError('Email already in use', 400);
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Log profile update
      logger.info(`User profile updated: ${user._id}`);

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  },

  // Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Please provide current and new password', 400);
      }

      if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters long', 400);
      }

      const user = await User.findById(req.user._id);
      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        throw new AppError('Current password is incorrect', 401);
      }

      user.password = newPassword;
      await user.save();

      // Log password change
      logger.info(`Password changed for user: ${user._id}`);

      res.json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController; 