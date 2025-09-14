// API service for fetching real-time agricultural data
// This service provides mock implementations that can be replaced with real APIs

import { errorService } from './errorService';
import { storageService } from './storageService';

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
}

export interface PestAlert {
  id: string;
  crop: string;
  pest: string;
  malayalam: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  affectedAreas: string[];
  recommendedAction: string;
  date: string;
}

export interface GovernmentAdvisory {
  id: string;
  title: string;
  malayalam: string;
  description: string;
  type: 'scheme' | 'advisory' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  validFrom: string;
  validTo: string;
  source: string;
  link?: string;
}

class ApiService {
  private baseUrl = 'https://api.example.com'; // Replace with actual API base URL
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
  
  // Weather API
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    const cacheKey = `weather_${latitude}_${longitude}`;
    
    try {
      // Check cache first
      const cachedData = await storageService.load<WeatherData>(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        return cachedData;
      }

      // In a real implementation, this would call an actual weather API
      // For now, we'll return mock data that simulates real-time updates
      const mockWeatherData: WeatherData = {
        current: {
          temperature: Math.round(25 + Math.random() * 10), // 25-35°C
          humidity: Math.round(60 + Math.random() * 30), // 60-90%
          windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
          description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
          icon: 'sun'
        },
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temperature: {
            min: Math.round(20 + Math.random() * 10),
            max: Math.round(25 + Math.random() * 15)
          },
          humidity: Math.round(50 + Math.random() * 40),
          rain: Math.round(Math.random() * 100),
          description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain'][Math.floor(Math.random() * 5)],
          icon: 'sun'
        })),
        alerts: [
          {
            type: 'weather',
            severity: 'medium',
            title: 'Heavy Rain Warning',
            description: 'Heavy rainfall expected in the next 24 hours. Take necessary precautions for your crops.',
            date: new Date().toISOString()
          }
        ]
      };
      
      // Cache the data
      await storageService.save(cacheKey, mockWeatherData);
      
      return mockWeatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Try to return cached data as fallback
      const fallbackData = await storageService.load<WeatherData>(cacheKey);
      if (fallbackData) {
        console.log('Returning cached weather data as fallback');
        return fallbackData;
      }
      
      // If no cached data, throw a proper error
      const appError = errorService.handleApiError(error, 'getWeatherData');
      throw appError;
    }
  }

  // Market Prices API
  async getMarketPrices(crop?: string): Promise<MarketPrice[]> {
    const cacheKey = `market_prices_${crop || 'all'}`;
    
    try {
      // Check cache first
      const cachedData = await storageService.load<MarketPrice[]>(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        return cachedData;
      }

      // In a real implementation, this would call a market price API
      const mockPrices: MarketPrice[] = [
        {
          crop: 'Rice',
          malayalam: 'നെല്ല്',
          currentPrice: 2850 + Math.round(Math.random() * 200 - 100),
          previousPrice: 2800,
          market: 'Kottayam Mandi',
          date: new Date().toISOString().split('T')[0],
          unit: 'quintal',
          trend: 'up',
          changePercent: 1.8
        },
        {
          crop: 'Coconut',
          malayalam: 'തെങ്ങ്',
          currentPrice: 12 + Math.round(Math.random() * 4 - 2),
          previousPrice: 11.5,
          market: 'Cochin Market',
          date: new Date().toISOString().split('T')[0],
          unit: 'piece',
          trend: 'up',
          changePercent: 4.3
        },
        {
          crop: 'Pepper',
          malayalam: 'കുരുമുളക്',
          currentPrice: 45000 + Math.round(Math.random() * 5000 - 2500),
          previousPrice: 46500,
          market: 'Idukki Spice Market',
          date: new Date().toISOString().split('T')[0],
          unit: 'quintal',
          trend: 'down',
          changePercent: -3.2
        },
        {
          crop: 'Cardamom',
          malayalam: 'ഏലം',
          currentPrice: 275000 + Math.round(Math.random() * 10000 - 5000),
          previousPrice: 270000,
          market: 'Kumily Market',
          date: new Date().toISOString().split('T')[0],
          unit: 'quintal',
          trend: 'up',
          changePercent: 1.9
        },
        {
          crop: 'Rubber',
          malayalam: 'റബ്ബർ',
          currentPrice: 18500 + Math.round(Math.random() * 1000 - 500),
          previousPrice: 18200,
          market: 'Rubber Board',
          date: new Date().toISOString().split('T')[0],
          unit: 'quintal',
          trend: 'up',
          changePercent: 1.6
        },
        {
          crop: 'Banana',
          malayalam: 'വാഴ',
          currentPrice: 2200 + Math.round(Math.random() * 200 - 100),
          previousPrice: 2200,
          market: 'Ernakulam Market',
          date: new Date().toISOString().split('T')[0],
          unit: 'quintal',
          trend: 'stable',
          changePercent: 0
        }
      ];

      if (crop) {
        return mockPrices.filter(price => 
          price.crop.toLowerCase().includes(crop.toLowerCase()) ||
          price.malayalam.includes(crop)
        );
      }

      // Cache the data
      await storageService.save(cacheKey, mockPrices);
      
      return mockPrices;
    } catch (error) {
      console.error('Error fetching market prices:', error);
      
      // Try to return cached data as fallback
      const fallbackData = await storageService.load<MarketPrice[]>(cacheKey);
      if (fallbackData) {
        console.log('Returning cached market prices as fallback');
        return fallbackData;
      }
      
      // If no cached data, return fallback data
      const fallbackPrices = this.getFallbackMarketPrices();
      return fallbackPrices;
    }
  }

  // Pest Alerts API
  async getPestAlerts(crop?: string, district?: string): Promise<PestAlert[]> {
    const cacheKey = `pest_alerts_${crop || 'all'}_${district || 'all'}`;
    
    try {
      // Check cache first
      const cachedData = await storageService.load<PestAlert[]>(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        return cachedData;
      }

      const mockPestAlerts: PestAlert[] = [
        {
          id: '1',
          crop: 'Rice',
          pest: 'Brown Plant Hopper',
          malayalam: 'ബ്രൗൺ പ്ലാന്റ് ഹോപ്പർ',
          severity: 'high',
          description: 'High incidence of brown plant hopper reported in rice fields. Immediate action required.',
          affectedAreas: ['Kottayam', 'Alappuzha', 'Pathanamthitta'],
          recommendedAction: 'Apply recommended insecticides and maintain proper water management.',
          date: new Date().toISOString()
        },
        {
          id: '2',
          crop: 'Coconut',
          pest: 'Rhinoceros Beetle',
          malayalam: 'കാട്ടുമുട്ട',
          severity: 'medium',
          description: 'Rhinoceros beetle infestation detected in coconut plantations.',
          affectedAreas: ['Thrissur', 'Palakkad'],
          recommendedAction: 'Use pheromone traps and biological control methods.',
          date: new Date().toISOString()
        },
        {
          id: '3',
          crop: 'Pepper',
          pest: 'Foot Rot',
          malayalam: 'കാല് ചീഞ്ഞ്',
          severity: 'urgent',
          description: 'Foot rot disease spreading rapidly in pepper vines due to excessive moisture.',
          affectedAreas: ['Idukki', 'Wayanad'],
          recommendedAction: 'Improve drainage and apply fungicides immediately.',
          date: new Date().toISOString()
        }
      ];

      let filteredAlerts = mockPestAlerts;

      if (crop) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.crop.toLowerCase().includes(crop.toLowerCase())
        );
      }

      if (district) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.affectedAreas.some(area => 
            area.toLowerCase().includes(district.toLowerCase())
          )
        );
      }

      // Cache the data
      await storageService.save(cacheKey, filteredAlerts);
      
      return filteredAlerts;
    } catch (error) {
      console.error('Error fetching pest alerts:', error);
      
      // Try to return cached data as fallback
      const fallbackData = await storageService.load<PestAlert[]>(cacheKey);
      if (fallbackData) {
        console.log('Returning cached pest alerts as fallback');
        return fallbackData;
      }
      
      // If no cached data, return fallback data
      return this.getFallbackPestAlerts();
    }
  }

  // Government Advisories API
  async getGovernmentAdvisories(): Promise<GovernmentAdvisory[]> {
    const cacheKey = 'government_advisories';
    
    try {
      // Check cache first
      const cachedData = await storageService.load<GovernmentAdvisory[]>(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        return cachedData;
      }

      const mockAdvisories: GovernmentAdvisory[] = [
        {
          id: '1',
          title: 'PM-KISAN Scheme 2024',
          malayalam: 'പിഎം-കിസാൻ പദ്ധതി 2024',
          description: 'Direct income support of ₹6,000 per year to all farmer families.',
          type: 'scheme',
          priority: 'high',
          validFrom: '2024-01-01',
          validTo: '2024-12-31',
          source: 'Ministry of Agriculture',
          link: 'https://pmkisan.gov.in'
        },
        {
          id: '2',
          title: 'Monsoon Advisory 2024',
          malayalam: 'മൺസൂൺ ഉപദേശം 2024',
          description: 'Prepare for delayed monsoon. Use water conservation techniques.',
          type: 'advisory',
          priority: 'medium',
          validFrom: new Date().toISOString().split('T')[0],
          validTo: '2024-09-30',
          source: 'IMD Kerala'
        },
        {
          id: '3',
          title: 'Organic Farming Subsidy',
          malayalam: 'ജൈവ കൃഷി സബ്സിഡി',
          description: '50% subsidy available for organic farming inputs and certification.',
          type: 'scheme',
          priority: 'medium',
          validFrom: '2024-04-01',
          validTo: '2024-12-31',
          source: 'Kerala State Organic Farming Mission',
          link: 'https://organic.kerala.gov.in'
        }
      ];

      // Cache the data
      await storageService.save(cacheKey, mockAdvisories);
      
      return mockAdvisories;
    } catch (error) {
      console.error('Error fetching government advisories:', error);
      
      // Try to return cached data as fallback
      const fallbackData = await storageService.load<GovernmentAdvisory[]>(cacheKey);
      if (fallbackData) {
        console.log('Returning cached government advisories as fallback');
        return fallbackData;
      }
      
      // If no cached data, return fallback data
      return this.getFallbackGovernmentAdvisories();
    }
  }

  // Soil Health API
  async getSoilHealthData(latitude: number, longitude: number): Promise<any> {
    const cacheKey = `soil_health_${latitude}_${longitude}`;
    
    try {
      // Check cache first
      const cachedData = await storageService.load<any>(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        return cachedData;
      }

      // Mock soil health data
      const soilData = {
        pH: 6.5 + Math.random() * 1.5, // 6.5-8.0
        organicMatter: 2.5 + Math.random() * 1.5, // 2.5-4.0%
        nitrogen: 150 + Math.random() * 100, // 150-250 kg/ha
        phosphorus: 20 + Math.random() * 30, // 20-50 kg/ha
        potassium: 200 + Math.random() * 150, // 200-350 kg/ha
        recommendations: [
          'Apply organic manure to improve soil structure',
          'Use balanced NPK fertilizers based on soil test',
          'Practice crop rotation to maintain soil health'
        ]
      };

      // Cache the data
      await storageService.save(cacheKey, soilData);
      
      return soilData;
    } catch (error) {
      console.error('Error fetching soil health data:', error);
      
      // Try to return cached data as fallback
      const fallbackData = await storageService.load<any>(cacheKey);
      if (fallbackData) {
        console.log('Returning cached soil health data as fallback');
        return fallbackData;
      }
      
      // If no cached data, return fallback data
      return {
        pH: 6.8,
        organicMatter: 3.0,
        nitrogen: 180,
        phosphorus: 35,
        potassium: 250,
        recommendations: [
          'Data not available - please contact local agriculture office',
          'Consider soil testing for accurate recommendations'
        ]
      };
    }
  }

  // Crop Calendar API
  async getCropCalendar(crop: string, location: string): Promise<any> {
    const cacheKey = `crop_calendar_${crop}_${location}`;
    
    try {
      // Check cache first
      const cachedData = await storageService.load<any>(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        return cachedData;
      }

      // Mock crop calendar data
      const calendars = {
        'Rice': {
          sowing: 'June-July',
          transplanting: 'July-August',
          flowering: 'October-November',
          harvesting: 'December-January',
          activities: [
            'Land preparation',
            'Seed treatment',
            'Transplanting',
            'Water management',
            'Fertilizer application',
            'Pest control',
            'Harvesting'
          ]
        },
        'Coconut': {
          planting: 'May-June',
          flowering: 'Year-round',
          harvesting: 'Year-round',
          activities: [
            'Planting',
            'Irrigation',
            'Fertilizer application',
            'Pest control',
            'Harvesting',
            'Processing'
          ]
        }
      };

      const result = calendars[crop as keyof typeof calendars] || null;
      
      if (result) {
        // Cache the data
        await storageService.save(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching crop calendar:', error);
      
      // Try to return cached data as fallback
      const fallbackData = await storageService.load<any>(cacheKey);
      if (fallbackData) {
        console.log('Returning cached crop calendar as fallback');
        return fallbackData;
      }
      
      // If no cached data, return null
      return null;
    }
  }

  // Check if cached data is still valid
  private isCacheValid(cachedData: any): boolean {
    if (!cachedData || !cachedData.timestamp) {
      return false;
    }
    
    const now = Date.now();
    const cacheAge = now - cachedData.timestamp;
    return cacheAge < this.cacheTimeout;
  }

  // Get fallback data for when API fails
  private getFallbackWeatherData(): WeatherData {
    return {
      current: {
        temperature: 28,
        humidity: 75,
        windSpeed: 10,
        description: 'Partly Cloudy',
        icon: 'sun'
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature: { min: 22, max: 30 },
        humidity: 70,
        rain: 20,
        description: 'Partly Cloudy',
        icon: 'sun'
      })),
      alerts: []
    };
  }

  private getFallbackMarketPrices(): MarketPrice[] {
    return [
      {
        crop: 'Rice',
        malayalam: 'നെല്ല്',
        currentPrice: 2800,
        previousPrice: 2800,
        market: 'Kottayam Mandi',
        date: new Date().toISOString().split('T')[0],
        unit: 'quintal',
        trend: 'stable',
        changePercent: 0
      }
    ];
  }

  private getFallbackPestAlerts(): PestAlert[] {
    return [];
  }

  private getFallbackGovernmentAdvisories(): GovernmentAdvisory[] {
    return [];
  }
}

// Create a singleton instance
export const apiService = new ApiService();
