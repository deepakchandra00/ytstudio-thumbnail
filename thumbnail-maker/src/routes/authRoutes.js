const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);  // Fixed async hashing

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isActive: true
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: ['user', 'admin']
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    console.log('\n=== Login Attempt ===');
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('Login debug:', {
      user,
      email,
      providedPassword:  password,
      storeid:user.email,
      storedHash: user.password
    });

    // Use async compare for better reliability
    const isMatch = await bcrypt.compare(password, user.password);  // Use async compare
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add a test route to check database connection and user existence
router.get('/test-db', async (req, res) => {
  try {
    const users = await User.find({}).select('+password');
    console.log('All users:', users.map(u => ({
      id: u._id,
      email: u.email,
      hasPassword: !!u.password,
      passwordLength: u.password?.length
    })));
    return res.json({ success: true, count: users.length });
  } catch (error) {
    console.error('DB Test Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Add a route to manually create a test user
router.post('/create-test-user', async (req, res) => {
  try {
    // Delete existing test user if exists
    await User.deleteOne({ email: 'test@example.com' });

    // Create new test user with known credentials
    const hashedPassword = await bcrypt.hash('test123', 10);  // Ensure async hashing
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isActive: true
    });

    console.log('Test user created:', {
      id: user._id,
      email: user.email,
      passwordHash: hashedPassword
    });

    return res.json({ 
      success: true, 
      message: 'Test user created',
      credentials: {
        email: 'test@example.com',
        password: 'test123'
      }
    });
  } catch (error) {
    console.error('Create Test User Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Add this test route to verify bcrypt functionality
router.post('/test-password', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Create a test hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Verify the hash immediately
    const isValid = await bcrypt.compare(password, hash);
    
    return res.json({
      success: true,
      password,
      hash,
      isValid,
      salt
    });
  } catch (error) {
    console.error('Password test error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Add this reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const newPassword = 'password123'; // The password we know works
    
    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user's password
    const user = await User.findOneAndUpdate(
      { email },
      { 
        password: hashedPassword,
        updatedAt: new Date()
      },
      { new: true }
    ).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Password reset debug:', {
      email,
      newHash: hashedPassword,
      passwordLength: hashedPassword.length
    });

    return res.json({
      success: true,
      message: 'Password reset successful',
      credentials: {
        email,
        password: newPassword
      }
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
