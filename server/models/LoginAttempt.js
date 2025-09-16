import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
  phone: { type: String, index: true },
  success: { type: Boolean, required: true },
  reason: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  location: {
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });

loginAttemptSchema.index({ createdAt: -1 });

export default mongoose.model('LoginAttempt', loginAttemptSchema);


