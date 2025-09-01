import { Farmer, Farm, Activity, Advisory, Crop } from '../types/farmer';

export const mockFarmer: Farmer = {
  id: '1',
  name: 'രാജേഷ് കുമാർ (Rajesh Kumar)',
  phone: '+91 9876543210',
  village: 'കുമരകം (Kumarakom)',
  district: 'കോട്ടയം (Kottayam)',
  registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  profileComplete: true
};

export const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'നെല്ല് (Rice)',
    variety: 'Jyothi',
    plantingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    area: 1.5,
    status: 'growing'
  },
  {
    id: '2',
    name: 'തെങ്ങ് (Coconut)',
    variety: 'West Coast Tall',
    plantingDate: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    area: 0.5,
    status: 'growing'
  }
];

export const mockFarm: Farm = {
  id: '1',
  farmerId: '1',
  landSize: 2.0,
  soilType: 'clay',
  irrigationType: 'canal',
  crops: mockCrops,
  location: {
    latitude: 9.6412,
    longitude: 76.3419,
    village: 'കുമരകം (Kumarakom)',
    district: 'കോട്ടയം (Kottayam)'
  }
};

export const mockActivities: Activity[] = [
  {
    id: '1',
    farmerId: '1',
    cropId: '1',
    type: 'sowing',
    description: 'Rice seeds planted in main field',
    date: '2025-01-15',
    notes: 'Used certified seeds from Krishi Bhavan'
  },
  {
    id: '2',
    farmerId: '1',
    cropId: '1',
    type: 'fertilizer',
    description: 'Applied urea fertilizer',
    date: '2025-01-20',
    cost: 850,
    notes: '50kg urea applied'
  },
  {
    id: '3',
    farmerId: '1',
    type: 'irrigation',
    description: 'Canal water irrigation',
    date: new Date().toISOString().split('T')[0],
    notes: 'Good water flow from canal'
  }
];

export const mockAdvisories: Advisory[] = [
  {
    id: '1',
    title: 'Heavy Rain Alert',
    description: 'Heavy rainfall expected for next 3 days. Avoid fertilizer application and ensure proper drainage.',
    type: 'weather',
    priority: 'high',
    date: new Date().toISOString().split('T')[0],
    farmerId: '1',
    actionRequired: true
  },
  {
    id: '2',
    title: 'Brown Plant Hopper Alert',
    description: 'BPH outbreak reported in nearby areas. Inspect your rice crop for brown spots on stems.',
    type: 'pest',
    priority: 'urgent',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    farmerId: '1',
    cropId: '1',
    actionRequired: true
  },
  {
    id: '3',
    title: 'PM-KISAN Registration Deadline',
    description: 'Last date for PM-KISAN scheme registration is approaching. Complete your application by January 31st.',
    type: 'scheme',
    priority: 'medium',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
    farmerId: '1',
    actionRequired: true
  }
];

export const weatherData = {
  current: {
    temperature: 28,
    humidity: 78,
    rainfall: 15,
    windSpeed: 12,
    visibility: 8,
    pressure: 1013,
    condition: 'partly_cloudy'
  },
  forecast: [
    { day: 'Today', temp: 28, condition: 'partly_cloudy', rain: 60 },
    { day: 'Tomorrow', temp: 26, condition: 'rainy', rain: 85 },
    { day: 'Day 3', temp: 27, condition: 'rainy', rain: 90 },
    { day: 'Day 4', temp: 29, condition: 'sunny', rain: 20 }
  ]
};