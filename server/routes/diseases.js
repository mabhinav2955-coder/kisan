import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import DiseaseReport from '../models/DiseaseReport.js';
import { validateImageFile, validateCoordinates } from '../utils/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/disease-reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 images
  },
  fileFilter: (req, file, cb) => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.error), false);
    }
  }
});

// AI Disease Detection (Mock Implementation)
const analyzeDisease = async (imagePath) => {
  try {
    // In production, this would integrate with TensorFlow.js or call a PyTorch API
    // For now, we'll simulate AI analysis with mock data
    
    const mockDiseases = [
      {
        disease: 'Leaf Blight',
        confidence: 85,
        alternatives: [
          { disease: 'Bacterial Spot', confidence: 70 },
          { disease: 'Fungal Infection', confidence: 60 }
        ]
      },
      {
        disease: 'Powdery Mildew',
        confidence: 92,
        alternatives: [
          { disease: 'Downy Mildew', confidence: 75 },
          { disease: 'Rust Disease', confidence: 65 }
        ]
      },
      {
        disease: 'Root Rot',
        confidence: 78,
        alternatives: [
          { disease: 'Nutrient Deficiency', confidence: 70 },
          { disease: 'Water Stress', confidence: 60 }
        ]
      }
    ];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return random disease for demo
    const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    
    return {
      success: true,
      diseaseDetected: randomDisease.disease,
      confidence: randomDisease.confidence,
      alternativeDiagnoses: randomDisease.alternatives,
      analysisStatus: 'completed'
    };
    
  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      success: false,
      errorMessage: 'Unable to detect disease. Please try again with a clearer picture.',
      analysisStatus: 'failed'
    };
  }
};

// Generate treatment recommendations
const generateRecommendations = (disease) => {
  const recommendations = {
    'Leaf Blight': {
      organic: [
        {
          treatment: 'Neem Oil Spray',
          dosage: '2-3ml per liter',
          frequency: 'Every 7 days',
          duration: '3-4 weeks'
        },
        {
          treatment: 'Copper-based Fungicide',
          dosage: '1-2g per liter',
          frequency: 'Every 10 days',
          duration: '2-3 weeks'
        }
      ],
      chemical: [
        {
          treatment: 'Chlorothalonil',
          dosage: '2-3g per liter',
          frequency: 'Every 7-10 days',
          duration: '2-3 weeks',
          safetyNotes: 'Wear protective gear. Avoid spraying during flowering.'
        }
      ],
      preventive: [
        {
          measure: 'Proper Spacing',
          description: 'Ensure adequate spacing between plants for air circulation'
        },
        {
          measure: 'Water Management',
          description: 'Avoid overhead watering. Water at soil level.'
        }
      ]
    },
    'Powdery Mildew': {
      organic: [
        {
          treatment: 'Baking Soda Solution',
          dosage: '1 tablespoon per gallon',
          frequency: 'Every 3-5 days',
          duration: '2-3 weeks'
        }
      ],
      chemical: [
        {
          treatment: 'Sulfur-based Fungicide',
          dosage: 'As per label instructions',
          frequency: 'Every 7-10 days',
          duration: '2-3 weeks',
          safetyNotes: 'Do not apply in hot weather. Test on small area first.'
        }
      ],
      preventive: [
        {
          measure: 'Pruning',
          description: 'Remove affected leaves and improve air circulation'
        }
      ]
    }
  };

  return recommendations[disease] || {
    organic: [{ treatment: 'Consult local agricultural expert', dosage: 'N/A', frequency: 'N/A', duration: 'N/A' }],
    chemical: [{ treatment: 'Consult local agricultural expert', dosage: 'N/A', frequency: 'N/A', duration: 'N/A', safetyNotes: 'N/A' }],
    preventive: [{ measure: 'General Plant Care', description: 'Maintain proper watering and nutrition' }]
  };
};

// Upload images and analyze disease
router.post('/analyze', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { cropName, cropVariety, symptoms, severity, location } = req.body;
    const farmerId = req.user.userId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    if (!cropName) {
      return res.status(400).json({
        success: false,
        message: 'Crop name is required'
      });
    }

    // Compress images
    const compressedImages = [];
    for (const file of req.files) {
      const compressedPath = file.path.replace(/\.[^/.]+$/, '_compressed.jpg');
      
      await sharp(file.path)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(compressedPath);

      compressedImages.push({
        filename: path.basename(compressedPath),
        originalName: file.originalname,
        mimetype: 'image/jpeg',
        size: fs.statSync(compressedPath).size,
        url: `/uploads/disease-reports/${path.basename(compressedPath)}`,
        compressed: true
      });

      // Remove original file to save space
      fs.unlinkSync(file.path);
    }

    // Create disease report
    const diseaseReport = new DiseaseReport({
      farmerId,
      cropName,
      cropVariety,
      images: compressedImages,
      location: location ? JSON.parse(location) : {},
      symptoms,
      severity: severity || 'moderate',
      aiAnalysis: {
        analysisStatus: 'processing'
      }
    });

    await diseaseReport.save();

    // Start AI analysis
    const analysisResult = await analyzeDisease(compressedImages[0].url);
    
    if (analysisResult.success) {
      // Generate recommendations
      const recommendations = generateRecommendations(analysisResult.diseaseDetected);
      
      // Update disease report with analysis results
      diseaseReport.aiAnalysis = {
        diseaseDetected: analysisResult.diseaseDetected,
        confidence: analysisResult.confidence,
        alternativeDiagnoses: analysisResult.alternativeDiagnoses,
        analysisStatus: 'completed'
      };
      
      diseaseReport.recommendations = recommendations;
      
      await diseaseReport.save();

      res.json({
        success: true,
        message: 'Disease analysis completed',
        reportId: diseaseReport._id,
        analysis: {
          diseaseDetected: analysisResult.diseaseDetected,
          confidence: analysisResult.confidence,
          alternativeDiagnoses: analysisResult.alternativeDiagnoses,
          recommendations
        }
      });
    } else {
      // Update with error
      diseaseReport.aiAnalysis = {
        analysisStatus: 'failed',
        errorMessage: analysisResult.errorMessage
      };
      await diseaseReport.save();

      res.status(400).json({
        success: false,
        message: analysisResult.errorMessage
      });
    }

  } catch (error) {
    console.error('Disease analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze disease. Please try again.'
    });
  }
});

// Get disease reports for a farmer
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const reports = await DiseaseReport.find({ farmerId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmerId', 'name phone village district');

    const total = await DiseaseReport.countDocuments({ farmerId });

    res.json({
      success: true,
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get disease reports'
    });
  }
});

// Get specific disease report
router.get('/reports/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;

    const report = await DiseaseReport.findOne({ _id: id, farmerId })
      .populate('farmerId', 'name phone village district');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Disease report not found'
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get disease report'
    });
  }
});

export default router;
