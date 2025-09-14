import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  village: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['english', 'malayalam'],
    default: 'english'
  },
  farmDetails: {
    location: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      pincode: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    landSize: { type: Number, default: 0 },
    soilType: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'red', 'black', 'alluvial'],
      default: 'loamy'
    },
    irrigationMethod: {
      type: String,
      enum: ['rain-fed', 'bore-well', 'canal', 'drip', 'sprinkler', 'flood'],
      default: 'rain-fed'
    },
    crops: [{
      name: { type: String, required: true },
      variety: { type: String, default: '' },
      area: { type: Number, required: true },
      plantingDate: { type: Date, required: true },
      expectedHarvestDate: { type: Date },
      status: {
        type: String,
        enum: ['planning', 'planted', 'growing', 'harvested'],
        default: 'planning'
      }
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  profileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ phone: 1 });
userSchema.index({ district: 1 });
userSchema.index({ 'farmDetails.crops.name': 1 });

export default mongoose.model('User', userSchema);
