import mongoose from 'mongoose';

const mobileUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure index exists
mobileUserSchema.index({ phone: 1 }, { unique: true });

const MobileUser = mongoose.models.MobileUser || mongoose.model('MobileUser', mobileUserSchema);
export default MobileUser;


