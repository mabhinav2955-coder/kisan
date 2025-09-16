import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOTP, sendOTP } from '../utils/otp.js';
import LoginAttempt from '../models/LoginAttempt.js';
import { validatePhone, validateOTP } from '../utils/validation.js';

const router = express.Router();

// Generate OTP for phone number
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    let user = await User.findOne({ phone });
    
    if (user) {
      // Update existing user's OTP
      user.otp = { code: otp, expiresAt };
      await user.save();
    } else {
      // Create new user with OTP
      user = new User({
        phone,
        otp: { code: otp, expiresAt }
      });
      await user.save();
    }

    // Send OTP (in production, this would send actual SMS)
    await sendOTP(phone, otp);

    // Log attempt (OTP sent)
    try {
      await LoginAttempt.create({
        phone,
        success: true,
        reason: 'otp_sent',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch {}

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate inputs
    if (!validatePhone(phone) || !validateOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number or OTP format'
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      try { await LoginAttempt.create({ phone, success: false, reason: 'user_not_found', ip: req.ip, userAgent: req.headers['user-agent'] }); } catch {}
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check OTP
    if (!user.otp || user.otp.code !== otp) {
      try { await LoginAttempt.create({ phone, success: false, reason: 'invalid_otp', ip: req.ip, userAgent: req.headers['user-agent'] }); } catch {}
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiration
    if (new Date() > user.otp.expiresAt) {
      try { await LoginAttempt.create({ phone, success: false, reason: 'otp_expired', ip: req.ip, userAgent: req.headers['user-agent'] }); } catch {}
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Clear OTP and update user
    user.otp = undefined;
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    try { await LoginAttempt.create({ phone, success: true, reason: 'login_success', ip: req.ip, userAgent: req.headers['user-agent'] }); } catch {}

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        village: user.village,
        district: user.district,
        language: user.language,
        profileComplete: user.profileComplete,
        farmDetails: user.farmDetails
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, village, district, language, farmDetails } = req.body;

    // Update user fields
    if (name) user.name = name;
    if (village) user.village = village;
    if (district) user.district = district;
    if (language) user.language = language;
    if (farmDetails) user.farmDetails = farmDetails;

    // Check if profile is complete
    user.profileComplete = !!(user.name && user.village && user.district && 
                             user.farmDetails?.landSize > 0 && 
                             user.farmDetails?.crops?.length > 0);

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        village: user.village,
        district: user.district,
        language: user.language,
        profileComplete: user.profileComplete,
        farmDetails: user.farmDetails
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        village: user.village,
        district: user.district,
        language: user.language,
        profileComplete: user.profileComplete,
        farmDetails: user.farmDetails,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile. Please try again.'
    });
  }
});

export default router;
