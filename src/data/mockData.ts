import { Farmer, Farm, Activity, Advisory, Crop } from '../types/farmer';

// This will be set dynamically based on logged in farmer
export let mockFarmer: Farmer = sampleFarmers[0];

export const sampleFarmers: Farmer[] = [
  {
    id: '1',
    name: 'രാജേഷ് കുമാർ (Rajesh Kumar)',
    phone: '+91 9876543210',
    village: 'കുമരകം (Kumarakom)',
    district: 'കോട്ടയം (Kottayam)',
    registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    profileComplete: true
  },
  {
    id: '2',
    name: 'സുധ കുമാരി (Sudha Kumari)',
    phone: '+91 9876543211',
    village: 'വയനാട് (Wayanad)',
    district: 'വയനാട് (Wayanad)',
    registrationDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    profileComplete: true
  },
  {
    id: '3',
    name: 'അജയ് കുമാർ (Ajay Kumar)',
    phone: '+91 9876543212',
    village: 'ആലപ്പുഴ (Alappuzha)',
    district: 'ആലപ്പുഴ (Alappuzha)',
    registrationDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    profileComplete: true
  },
  {
    id: '4',
    name: 'പ്രിയ നായർ (Priya Nair)',
    phone: '+91 9876543213',
    village: 'തൃശ്ശൂർ (Thrissur)',
    district: 'തൃശ്ശൂർ (Thrissur)',
    registrationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    profileComplete: true
  }
];

// Farmer-specific crop data
export const farmerCrops: Record<string, Crop[]> = {
  '1': [ // Rajesh Kumar - Rice and Coconut farmer
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
  ],
  '2': [ // Sudha Kumari - Spice farmer
    {
      id: '3',
      name: 'കുരുമുളക് (Pepper)',
      variety: 'Panniyur 1',
      plantingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 0.8,
      status: 'growing'
    },
    {
      id: '4',
      name: 'ഏലം (Cardamom)',
      variety: 'Malabar',
      plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 0.3,
      status: 'growing'
    },
    {
      id: '5',
      name: 'കാപ്പി (Coffee)',
      variety: 'Arabica',
      plantingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 1.2,
      status: 'growing'
    }
  ],
  '3': [ // Ajay Kumar - Coconut and Banana farmer
    {
      id: '6',
      name: 'തെങ്ങ് (Coconut)',
      variety: 'Chowghat Orange Dwarf',
      plantingDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 2.0,
      status: 'growing'
    },
    {
      id: '7',
      name: 'വാഴ (Banana)',
      variety: 'Nendran',
      plantingDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 0.7,
      status: 'growing'
    }
  ],
  '4': [ // Priya Nair - Vegetable farmer
    {
      id: '8',
      name: 'തക്കാളി (Tomato)',
      variety: 'Arka Rakshak',
      plantingDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 0.4,
      status: 'growing'
    },
    {
      id: '9',
      name: 'വെണ്ടക്ക (Okra)',
      variety: 'Arka Anamika',
      plantingDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 0.3,
      status: 'growing'
    },
    {
      id: '10',
      name: 'മുളക് (Chili)',
      variety: 'Kanthari',
      plantingDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      area: 0.2,
      status: 'growing'
    }
  ]
};

// Farmer-specific farm data
export const farmerFarms: Record<string, Farm> = {
  '1': { // Rajesh Kumar
    id: '1',
    farmerId: '1',
    landSize: 2.0,
    soilType: 'clay',
    irrigationType: 'canal',
    crops: farmerCrops['1'],
    location: {
      latitude: 9.6412,
      longitude: 76.3419,
      village: 'കുമരകം (Kumarakom)',
      district: 'കോട്ടയം (Kottayam)'
    }
  },
  '2': { // Sudha Kumari
    id: '2',
    farmerId: '2',
    landSize: 2.3,
    soilType: 'red',
    irrigationType: 'rain-fed',
    crops: farmerCrops['2'],
    location: {
      latitude: 11.6854,
      longitude: 76.1320,
      village: 'വയനാട് (Wayanad)',
      district: 'വയനാട് (Wayanad)'
    }
  },
  '3': { // Ajay Kumar
    id: '3',
    farmerId: '3',
    landSize: 2.7,
    soilType: 'sandy',
    irrigationType: 'bore-well',
    crops: farmerCrops['3'],
    location: {
      latitude: 9.4981,
      longitude: 76.3388,
      village: 'ആലപ്പുഴ (Alappuzha)',
      district: 'ആലപ്പുഴ (Alappuzha)'
    }
  },
  '4': { // Priya Nair
    id: '4',
    farmerId: '4',
    landSize: 0.9,
    soilType: 'loamy',
    irrigationType: 'drip',
    crops: farmerCrops['4'],
    location: {
      latitude: 10.5276,
      longitude: 76.2144,
      village: 'തൃശ്ശൂർ (Thrissur)',
      district: 'തൃശ്ശൂർ (Thrissur)'
    }
  }
};

// Farmer-specific activities
export const farmerActivities: Record<string, Activity[]> = {
  '1': [ // Rajesh Kumar - Rice farmer activities
    {
      id: '1',
      farmerId: '1',
      cropId: '1',
      type: 'sowing',
      description: 'Rice seeds planted in main field',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Used certified seeds from Krishi Bhavan'
    },
    {
      id: '2',
      farmerId: '1',
      cropId: '1',
      type: 'fertilizer',
      description: 'Applied urea fertilizer',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
  ],
  '2': [ // Sudha Kumari - Spice farmer activities
    {
      id: '4',
      farmerId: '2',
      cropId: '3',
      type: 'sowing',
      description: 'Pepper vines planted with support poles',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Used disease-resistant variety'
    },
    {
      id: '5',
      farmerId: '2',
      cropId: '4',
      type: 'fertilizer',
      description: 'Applied organic compost to cardamom',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cost: 1200,
      notes: 'Homemade compost from farm waste'
    },
    {
      id: '6',
      farmerId: '2',
      type: 'weeding',
      description: 'Manual weeding in spice garden',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Removed invasive weeds around pepper vines'
    }
  ],
  '3': [ // Ajay Kumar - Coconut farmer activities
    {
      id: '7',
      farmerId: '3',
      cropId: '6',
      type: 'fertilizer',
      description: 'Applied coconut-specific fertilizer',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cost: 2500,
      notes: 'Applied around the base of each tree'
    },
    {
      id: '8',
      farmerId: '3',
      cropId: '7',
      type: 'harvest',
      description: 'Harvested ripe banana bunches',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Good quality Nendran bananas'
    },
    {
      id: '9',
      farmerId: '3',
      type: 'irrigation',
      description: 'Bore well irrigation for coconut trees',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Water level is good in bore well'
    }
  ],
  '4': [ // Priya Nair - Vegetable farmer activities
    {
      id: '10',
      farmerId: '4',
      cropId: '8',
      type: 'sowing',
      description: 'Tomato seedlings transplanted',
      date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Healthy seedlings from nursery'
    },
    {
      id: '11',
      farmerId: '4',
      cropId: '9',
      type: 'pesticide',
      description: 'Applied organic neem spray',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cost: 300,
      notes: 'Preventive spray for pest control'
    },
    {
      id: '12',
      farmerId: '4',
      type: 'irrigation',
      description: 'Drip irrigation system maintenance',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Cleaned drip emitters and checked water flow'
    }
  ]
};

// Farmer-specific advisories
export const farmerAdvisories: Record<string, Advisory[]> = {
  '1': [ // Rajesh Kumar - Rice farmer advisories
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
    }
  ],
  '2': [ // Sudha Kumari - Spice farmer advisories
    {
      id: '3',
      title: 'Pepper Wilt Disease Alert',
      description: 'Monitor pepper vines for yellowing leaves. Apply Trichoderma as preventive measure.',
      type: 'pest',
      priority: 'high',
      date: new Date().toISOString().split('T')[0],
      farmerId: '2',
      cropId: '3',
      actionRequired: true
    },
    {
      id: '4',
      title: 'Cardamom Price Surge',
      description: 'Cardamom prices increased by 15% in Kumily market. Good time for harvest and sale.',
      type: 'general',
      priority: 'medium',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split('T')[0],
      farmerId: '2',
      actionRequired: false
    }
  ],
  '3': [ // Ajay Kumar - Coconut farmer advisories
    {
      id: '5',
      title: 'Coconut Mite Infestation',
      description: 'Check coconut fronds for mite damage. Apply sulfur spray if symptoms found.',
      type: 'pest',
      priority: 'medium',
      date: new Date().toISOString().split('T')[0],
      farmerId: '3',
      cropId: '6',
      actionRequired: true
    },
    {
      id: '6',
      title: 'Banana Harvest Timing',
      description: 'Your Nendran bananas are ready for harvest. Check for proper maturity indicators.',
      type: 'general',
      priority: 'high',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split('T')[0],
      farmerId: '3',
      cropId: '7',
      actionRequired: true
    }
  ],
  '4': [ // Priya Nair - Vegetable farmer advisories
    {
      id: '7',
      title: 'Tomato Blight Warning',
      description: 'High humidity may cause tomato blight. Ensure good air circulation and apply copper spray.',
      type: 'pest',
      priority: 'urgent',
      date: new Date().toISOString().split('T')[0],
      farmerId: '4',
      cropId: '8',
      actionRequired: true
    },
    {
      id: '8',
      title: 'Vegetable Market Demand',
      description: 'High demand for organic vegetables in Thrissur market. Consider organic certification.',
      type: 'general',
      priority: 'low',
      date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString().split('T')[0],
      farmerId: '4',
      actionRequired: false
    }
  ]
};

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

// Helper functions to get farmer-specific data
export const getFarmerData = (farmerId: string) => {
  return {
    farmer: sampleFarmers.find(f => f.id === farmerId) || sampleFarmers[0],
    farm: farmerFarms[farmerId] || farmerFarms['1'],
    activities: farmerActivities[farmerId] || farmerActivities['1'],
    advisories: farmerAdvisories[farmerId] || farmerAdvisories['1']
  };
};

// Set current farmer data
export const setCurrentFarmer = (farmerId: string) => {
  mockFarmer = sampleFarmers.find(f => f.id === farmerId) || sampleFarmers[0];
};

// Default exports for backward compatibility
export const mockCrops = farmerCrops['1'];
export const mockFarm = farmerFarms['1'];
export const mockActivities = farmerActivities['1'];
export const mockAdvisories = farmerAdvisories['1'];