import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    language: {
      type: String,
      enum: ['english', 'malayalam'],
      default: 'english'
    },
    type: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      weatherData: mongoose.Schema.Types.Mixed,
      marketData: mongoose.Schema.Types.Mixed,
      pestAlerts: mongoose.Schema.Types.Mixed,
      governmentAdvisories: mongoose.Schema.Types.Mixed
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatHistorySchema.index({ farmerId: 1, createdAt: -1 });
chatHistorySchema.index({ sessionId: 1 });
chatHistorySchema.index({ isArchived: 1, lastAccessed: -1 });

export default mongoose.model('ChatHistory', chatHistorySchema);
