import express from 'express';
import Activity from '../models/Activity.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new activity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const {
      type,
      title,
      description,
      date,
      scheduledDate,
      priority,
      notes,
      cost,
      location,
      cropId
    } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and description are required'
      });
    }

    const activity = new Activity({
      farmerId,
      cropId,
      type,
      title,
      description,
      date: new Date(date),
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      priority: priority || 'medium',
      notes,
      cost,
      location
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      activity
    });

  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity'
    });
  }
});

// Get activities for a farmer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      priority,
      startDate,
      endDate,
      cropId
    } = req.query;

    // Build query
    let query = { farmerId };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (cropId) query.cropId = cropId;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const activities = await Activity.find(query)
      .sort({ scheduledDate: 1, date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      activities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities'
    });
  }
});

// Get activity roadmap/calendar view
router.get('/roadmap', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { cropId, startDate, endDate } = req.query;

    let query = { farmerId };
    if (cropId) query.cropId = cropId;
    
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const activities = await Activity.find(query)
      .sort({ scheduledDate: 1 })
      .populate('cropId', 'name variety');

    // Group activities by date
    const roadmap = {};
    activities.forEach(activity => {
      const dateKey = activity.scheduledDate?.toISOString().split('T')[0] || 'unscheduled';
      if (!roadmap[dateKey]) {
        roadmap[dateKey] = [];
      }
      roadmap[dateKey].push(activity);
    });

    // Calculate statistics
    const stats = {
      total: activities.length,
      completed: activities.filter(a => a.status === 'completed').length,
      pending: activities.filter(a => a.status === 'pending').length,
      overdue: activities.filter(a => a.status === 'overdue').length,
      inProgress: activities.filter(a => a.status === 'in-progress').length
    };

    res.json({
      success: true,
      roadmap,
      stats,
      activities
    });

  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity roadmap'
    });
  }
});

// Update activity status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const farmerId = req.user.userId;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const activity = await Activity.findOne({ _id: id, farmerId });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    activity.status = status;
    if (notes) activity.notes = notes;
    
    // If marking as completed, set completion date
    if (status === 'completed' && !activity.date) {
      activity.date = new Date();
    }

    await activity.save();

    res.json({
      success: true,
      message: 'Activity status updated successfully',
      activity
    });

  } catch (error) {
    console.error('Update activity status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity status'
    });
  }
});

// Get overdue activities
router.get('/overdue', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueActivities = await Activity.find({
      farmerId,
      scheduledDate: { $lt: today },
      status: { $in: ['pending', 'in-progress'] }
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      activities: overdueActivities,
      count: overdueActivities.length
    });

  } catch (error) {
    console.error('Get overdue activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overdue activities'
    });
  }
});

// Get upcoming activities (next 7 days)
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingActivities = await Activity.find({
      farmerId,
      scheduledDate: { $gte: today, $lte: nextWeek },
      status: { $in: ['pending', 'in-progress'] }
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      activities: upcomingActivities,
      count: upcomingActivities.length
    });

  } catch (error) {
    console.error('Get upcoming activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming activities'
    });
  }
});

// Delete an activity
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;

    const activity = await Activity.findOne({ _id: id, farmerId });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await Activity.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity'
    });
  }
});

export default router;
