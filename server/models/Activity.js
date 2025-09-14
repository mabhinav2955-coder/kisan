import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: false
  },
  type: {
    type: String,
    enum: ['sowing', 'irrigation', 'fertilizer', 'pesticide', 'weeding', 'harvest', 'pruning', 'spraying'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  date: {
    type: Date,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  cost: {
    type: Number,
    min: 0
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      default: 'push'
    },
    scheduledFor: Date,
    sent: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
activitySchema.index({ farmerId: 1, date: -1 });
activitySchema.index({ farmerId: 1, status: 1 });
activitySchema.index({ scheduledDate: 1, status: 1 });

export default mongoose.model('Activity', activitySchema);
