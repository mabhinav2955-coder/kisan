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
  private baseUrl = 'https://api.example.com'; // Replace with actual API base URL (unused for weather)
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
  
  // Weather API (real: Open-Meteo). If coords missing, use browser geolocation.
  async getWeatherData(latitude?: number, longitude?: number): Promise<WeatherData & { timestamp: number }> {
    // Resolve location
    let lat = latitude;
    let lon = longitude;
    if ((lat == null || lon == null) && typeof window !== 'undefined' && 'geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: 600000, timeout: 3000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {
        // default to Thiruvananthapuram if geolocation not available
        lat = 8.5241;
        lon = 76.9366;
      }
    }

    // Final safety defaults
    lat = lat ?? 8.5241;
    lon = lon ?? 76.9366;

    const cacheKey = `weather_${lat}_${lon}`;
    
    try {
      // Check cache first
      const cachedData = await storageService.load<WeatherData & { timestamp: number }>(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        return cachedData;
      }

      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum'
      });
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
      const data = await res.json();

      const currentTemp = data?.current?.temperature_2m ?? 28;
      const currentHumidity = data?.current?.relative_humidity_2m ?? 70;
      const currentWind = data?.current?.wind_speed_10m ?? 10; // km/h (Open-Meteo)
      const todayRain = Array.isArray(data?.daily?.precipitation_sum) ? (data.daily.precipitation_sum?.[0] ?? 0) : 0;

      const alerts: WeatherData['alerts'] = [];
      if (todayRain >= 20) {
        alerts.push({
          type: 'weather',
          severity: todayRain >= 50 ? 'urgent' : todayRain >= 35 ? 'high' : 'medium',
          title: 'Heavy Rainfall Warning',
          description: `Expected rainfall today: ${todayRain.toFixed(0)} mm. Protect harvested produce and ensure drainage.`,
          date: new Date().toISOString()
        });
      }
      if (currentWind >= 40) {
        alerts.push({
          type: 'weather',
          severity: currentWind >= 60 ? 'urgent' : currentWind >= 50 ? 'high' : 'medium',
          title: 'Strong Wind Alert',
          description: `Wind speeds up to ${currentWind.toFixed(0)} km/h. Secure equipment and structures.`,
          date: new Date().toISOString()
        });
      }
      if (currentTemp >= 35 && currentHumidity >= 50) {
        alerts.push({
          type: 'weather',
          severity: currentTemp >= 38 ? 'high' : 'medium',
          title: 'Heat Wave Conditions',
          description: `High temperature of ${currentTemp.toFixed(0)}°C with humidity ${currentHumidity}%. Irrigate early morning/evening and provide shade.`,
          date: new Date().toISOString()
        });
      }

      const now: WeatherData & { timestamp: number } = {
        current: {
          temperature: currentTemp,
          humidity: currentHumidity,
          windSpeed: currentWind,
          description: typeof data?.current?.weather_code === 'number' ? String(data.current.weather_code) : 'N/A',
          icon: 'sun'
        },
        forecast: Array.isArray(data?.daily?.time)
          ? data.daily.time.slice(0, 7).map((d: string, i: number) => ({
              date: d,
              temperature: {
                min: data.daily.temperature_2m_min?.[i] ?? 22,
                max: data.daily.temperature_2m_max?.[i] ?? 30
              },
              humidity: 70,
              rain: data.daily.precipitation_sum?.[i] ?? 0,
              description: 'Forecast',
              icon: 'sun'
            }))
          : [],
        alerts,
        timestamp: Date.now()
      };
      
      // Cache the data with timestamp
      await storageService.save(cacheKey, now);
      
      return now;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Try to return cached data as fallback
      const fallbackData = await storageService.load<WeatherData & { timestamp: number }>(cacheKey);
      if (fallbackData) {
        return fallbackData;
      }
      
      // If no cached data, throw a proper error
      const appError = errorService.handleApiError(error, 'getWeatherData');
      throw appError;
    }
  }

  // Market Prices API (backend live route)
  async getMarketPrices(crop?: string): Promise<MarketPrice[] & any> {
    const key = `market_prices_${crop || 'all'}`;
    const cached = await storageService.load<any>(key);
    if (cached && this.isCacheValid(cached)) return cached;
    try {
      const params = crop ? `?crop=${encodeURIComponent(crop)}` : '';
      const res = await fetch(`/api/data/market-prices${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      } as any);
      if (!res.ok) throw new Error('market');
      const json = await res.json();
      const data = json.data || [];
      const payload = Object.assign([], data, { timestamp: Date.now() });
      await storageService.save(key, payload);
      return payload;
    } catch (e) {
      if (cached) return cached;
      return this.getFallbackMarketPrices();
    }
  }

  // Pest Alerts API
  async getPestAlerts(crop?: string, district?: string): Promise<PestAlert[] & any> {
    const key = `pest_alerts_${crop || 'all'}_${district || 'all'}`;
    const cached = await storageService.load<any>(key);
    if (cached && this.isCacheValid(cached)) return cached;
    try {
      const params = new URLSearchParams();
      if (crop) params.set('crop', crop);
      if (district) params.set('district', district);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/data/pest-alerts${qs}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      } as any);
      if (!res.ok) throw new Error('pest');
      const json = await res.json();
      const data = json.data || [];
      const payload = Object.assign([], data, { timestamp: Date.now() });
      await storageService.save(key, payload);
      return payload;
    } catch (e) {
      if (cached) return cached;
      return this.getFallbackPestAlerts();
    }
  }

  // Government Advisories API
  async getGovernmentAdvisories(): Promise<GovernmentAdvisory[] & any> {
    const key = 'government_advisories';
    const cached = await storageService.load<any>(key);
    if (cached && this.isCacheValid(cached)) return cached;
    try {
      const res = await fetch(`/api/data/government-advisories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      } as any);
      if (!res.ok) throw new Error('gov');
      const json = await res.json();
      const data = json.data || [];
      const payload = Object.assign([], data, { timestamp: Date.now() });
      await storageService.save(key, payload);
      return payload;
    } catch (e) {
      if (cached) return cached;
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
    return [
      {
        id: 'fallback-1',
        crop: 'Rice',
        pest: 'Brown Plant Hopper',
        malayalam: 'ബ്രൗൺ പ്ലാന്റ് ഹോപ്പർ',
        severity: 'high',
        description: 'High incidence reported in paddy fields. Monitor closely.',
        affectedAreas: ['Kottayam', 'Alappuzha'],
        recommendedAction: 'Apply recommended insecticide and manage irrigation.',
        date: new Date().toISOString()
      }
    ];
  }

  private getFallbackGovernmentAdvisories(): GovernmentAdvisory[] {
    return [
      {
        id: 'pmkisan-fallback',
        title: 'PM-KISAN Scheme',
        malayalam: 'പിഎം-കിസാൻ പദ്ധതി',
        description: 'Direct income support to farmer families (₹6,000/year).',
        type: 'scheme',
        priority: 'medium',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        source: 'Govt of India',
        link: 'https://pmkisan.gov.in'
      }
    ];
  }
}

// Create a singleton instance
export const apiService = new ApiService();
