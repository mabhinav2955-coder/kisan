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