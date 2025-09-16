import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user with proper validation
router.post('/register', async (req, res) => {
  try {
    const { phone, name, password, village, district, language = 'english' } = req.body || {};
    
    // Validate required fields
    if (!phone || !name || !password || !village || !district) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: phone, name, password, village, district' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Normalize Indian phone numbers: keep digits, use last 10 digits
    const digitsOnly = String(phone).replace(/\D/g, '');
    const normalizedPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    const isValidPhone = /^[6-9]\d{9}$/.test(normalizedPhone);
    
    if (!isValidPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number. Enter 10 digits starting with 6-9.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this phone number already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      phone: normalizedPhone,
      name,
      password: hashedPassword,
      village,
      district,
      language,
      profileComplete: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        village: user.village,
        district: user.district
      },
      token 
    });
  } catch (error) {
    console.error('Register user error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        error: `Validation failed: ${errors.join(', ')}` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register user. Please try again.' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body || {};
    
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and password are required' 
      });
    }

    // Normalize phone number
    const digitsOnly = String(phone).replace(/\D/g, '');
    const normalizedPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    // Find user
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid phone number or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid phone number or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    return res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        village: user.village,
        district: user.district
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;

    // Get user's activity count
    const Activity = (await import('../models/Activity.js')).default;
    const Post = (await import('../models/Post.js')).default;
    const DiseaseReport = (await import('../models/DiseaseReport.js')).default;

    const [activityCount, postCount, diseaseReportCount] = await Promise.all([
      Activity.countDocuments({ farmerId }),
      Post.countDocuments({ author: farmerId, isDeleted: false }),
      DiseaseReport.countDocuments({ farmerId })
    ]);

    res.json({
      success: true,
      stats: {
        activities: activityCount,
        posts: postCount,
        diseaseReports: diseaseReportCount
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

// Get user's recent activity summary
router.get('/activity-summary', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const Activity = (await import('../models/Activity.js')).default;
    const Post = (await import('../models/Post.js')).default;
    const DiseaseReport = (await import('../models/DiseaseReport.js')).default;

    const [recentActivities, recentPosts, recentReports] = await Promise.all([
      Activity.find({ 
        farmerId, 
        createdAt: { $gte: startDate } 
      }).sort({ createdAt: -1 }).limit(5),
      
      Post.find({ 
        author: farmerId, 
        isDeleted: false,
        createdAt: { $gte: startDate } 
      }).sort({ createdAt: -1 }).limit(5),
      
      DiseaseReport.find({ 
        farmerId, 
        createdAt: { $gte: startDate } 
      }).sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      summary: {
        activities: recentActivities,
        posts: recentPosts,
        diseaseReports: recentReports
      }
    });

  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity summary'
    });
  }
});

export default router;
