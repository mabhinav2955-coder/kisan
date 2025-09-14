export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  registrationDate: string;
  profileComplete: boolean;
  farmDetails?: FarmDetails;
}

export interface FarmDetails {
  location: {
    latitude: number;
    longitude: number;
    pincode: string;
    address: string;
  };
  landSize: number;
  soilType: 'clay' | 'sandy' | 'loamy' | 'red' | 'black' | 'alluvial';
  irrigationMethod: 'rain-fed' | 'bore-well' | 'canal' | 'drip' | 'sprinkler' | 'flood';
  crops: {
    name: string;
    variety: string;
    area: number;
    plantingDate: string;
    expectedHarvestDate: string;
    status: 'planning' | 'planted' | 'growing' | 'harvested';
  }[];
}

export interface Farm {
  id: string;
  farmerId: string;
  landSize: number;
  soilType: 'clay' | 'sandy' | 'loamy' | 'red' | 'black';
  irrigationType: 'rain-fed' | 'bore-well' | 'canal' | 'drip' | 'sprinkler';
  crops: Crop[];
  location: {
    latitude: number;
    longitude: number;
    village: string;
    district: string;
  };
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: string;
  harvestDate?: string;
  area: number;
  status: 'planning' | 'planted' | 'growing' | 'harvested';
}

export interface Activity {
  id: string;
  farmerId: string;
  cropId?: string;
  type: 'sowing' | 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'harvest';
  description: string;
  date: string;
  notes?: string;
  cost?: number;
}

export interface Advisory {
  id: string;
  title: string;
  description: string;
  type: 'weather' | 'pest' | 'nutrient' | 'general' | 'scheme';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  farmerId: string;
  cropId?: string;
  actionRequired: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  language: 'english' | 'malayalam';
  type: 'text' | 'voice';
}

export interface AuthUser {
  id: string;
  phone: string;
  isAuthenticated: boolean;
}

export interface MarketPrice {
  crop: string;
  malayalam: string;
  currentPrice: number;
  previousPrice: number;
  market: string;
  date: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  timestamp?: string;
}

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    rain: number;
    description: string;
    icon: string;
  }>;
  alerts: Array<{
    type: 'weather' | 'pest' | 'disease';
    severity: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    date: string;
  }>;
  timestamp?: string;
}

export interface PestAlert {
  id: string;
  crop: string;
  pest: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  recommendation: string;
  date: string;
  location: string;
}

export interface GovernmentAdvisory {
  id: string;
  title: string;
  description: string;
  type: 'scheme' | 'subsidy' | 'training' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  link?: string;
}

export interface SoilHealthData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  recommendations: string[];
  lastTested: string;
}

export interface CropCalendarEvent {
  id: string;
  crop: string;
  activity: string;
  startDate: string;
  endDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// New interfaces for enhanced features
export interface DiseaseReport {
  id: string;
  farmerId: string;
  cropName: string;
  cropVariety?: string;
  images: ImageFile[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    pincode: string;
  };
  symptoms?: string;
  severity: 'mild' | 'moderate' | 'severe';
  aiAnalysis: {
    diseaseDetected?: string;
    confidence?: number;
    alternativeDiagnoses?: Array<{
      disease: string;
      confidence: number;
    }>;
    analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
    errorMessage?: string;
  };
  recommendations?: {
    organic: Array<{
      treatment: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    chemical: Array<{
      treatment: string;
      dosage: string;
      frequency: string;
      duration: string;
      safetyNotes: string;
    }>;
    preventive: Array<{
      measure: string;
      description: string;
    }>;
  };
  followUp?: {
    scheduledDate: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
  };
  status: 'active' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
}

export interface ImageFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  compressed?: boolean;
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    village: string;
    district: string;
  };
  title: string;
  content: string;
  images: ImageFile[];
  category: 'general' | 'crop-care' | 'pest-control' | 'weather' | 'market' | 'equipment' | 'schemes';
  tags: string[];
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  dislikes: Array<{
    user: string;
    createdAt: string;
  }>;
  replies: Array<{
    id: string;
    author: {
      id: string;
      name: string;
      village: string;
      district: string;
    };
    content: string;
    images: ImageFile[];
    likes: Array<{
      user: string;
      createdAt: string;
    }>;
    dislikes: Array<{
      user: string;
      createdAt: string;
    }>;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  isDeleted: boolean;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  userLiked?: boolean;
  userDisliked?: boolean;
}

export interface ActivityTask {
  id: string;
  farmerId: string;
  cropId?: string;
  type: 'sowing' | 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'harvest' | 'pruning' | 'spraying';
  title: string;
  description: string;
  date: string;
  scheduledDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  cost?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  attachments: ImageFile[];
  reminders: Array<{
    type: 'email' | 'sms' | 'push';
    scheduledFor: string;
    sent: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  farmerId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    language: 'english' | 'malayalam';
    type: 'text' | 'voice';
    timestamp: string;
    metadata?: {
      weatherData?: any;
      marketData?: any;
      pestAlerts?: any;
      governmentAdvisories?: any;
    };
  }>;
  isArchived: boolean;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherAlert {
  id: string;
  type: 'rainfall' | 'heatwave' | 'wind' | 'storm' | 'drought';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  affectedAreas: string[];
  validFrom: string;
  validTo: string;
  recommendations: string[];
  createdAt: string;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  type: 'subsidy' | 'insurance' | 'loan' | 'training' | 'equipment';
  category: 'crop' | 'livestock' | 'equipment' | 'infrastructure' | 'general';
  eligibility: string[];
  benefits: string[];
  applicationDeadline?: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  documentsRequired: string[];
  status: 'active' | 'upcoming' | 'expired';
  createdAt: string;
}