import mongoose from 'mongoose';

const diseaseReportSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: true,
    maxlength: 100
  },
  cropVariety: {
    type: String,
    maxlength: 100
  },
  images: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    compressed: Boolean
  }],
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    pincode: String
  },
  symptoms: {
    type: String,
    maxlength: 1000
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'moderate'
  },
  aiAnalysis: {
    diseaseDetected: {
      type: String,
      maxlength: 200
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    alternativeDiagnoses: [{
      disease: String,
      confidence: Number
    }],
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    errorMessage: String
  },
  recommendations: {
    organic: [{
      treatment: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    chemical: [{
      treatment: String,
      dosage: String,
      frequency: String,
      duration: String,
      safetyNotes: String
    }],
    preventive: [{
      measure: String,
      description: String
    }]
  },
  followUp: {
    scheduledDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    notes: String
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'escalated'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
diseaseReportSchema.index({ farmerId: 1, createdAt: -1 });
diseaseReportSchema.index({ cropName: 1 });
diseaseReportSchema.index({ 'aiAnalysis.diseaseDetected': 1 });
diseaseReportSchema.index({ status: 1 });

export default mongoose.model('DiseaseReport', diseaseReportSchema);
