import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public upsert for demo: register/update user basic details by phone
router.post('/register', async (req, res) => {
  try {
    const { phone, name, village, district, language = 'english' } = req.body || {};
    if (!phone || !name || !village || !district) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const update = {
      phone,
      name,
      village,
      district,
      language,
      profileComplete: true
    };

    const user = await User.findOneAndUpdate(
      { phone },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
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
