import { apiService } from '../services/apiService';

// Mock the storage service
jest.mock('../services/storageService', () => ({
  storageService: {
    load: jest.fn(),
    save: jest.fn(),
    isStorageAvailable: () => true
  }
}));

// Mock the error service
jest.mock('../services/errorService', () => ({
  errorService: {
    handleApiError: jest.fn((error) => ({
      code: 'API_ERROR',
      message: 'API request failed',
      timestamp: new Date(),
      details: error
    }))
  }
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWeatherData', () => {
    it('returns weather data with valid coordinates', async () => {
      const result = await apiService.getWeatherData(10.0, 76.0);
      
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('forecast');
      expect(result).toHaveProperty('alerts');
      expect(result.current).toHaveProperty('temperature');
      expect(result.current).toHaveProperty('humidity');
      expect(result.current).toHaveProperty('description');
    });

    it('returns forecast data for 7 days', async () => {
      const result = await apiService.getWeatherData(10.0, 76.0);
      
      expect(result.forecast).toHaveLength(7);
      result.forecast.forEach(day => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('temperature');
        expect(day).toHaveProperty('humidity');
        expect(day).toHaveProperty('description');
      });
    });
  });

  describe('getMarketPrices', () => {
    it('returns market prices for all crops', async () => {
      const result = await apiService.getMarketPrices();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(price => {
        expect(price).toHaveProperty('crop');
        expect(price).toHaveProperty('malayalam');
        expect(price).toHaveProperty('currentPrice');
        expect(price).toHaveProperty('previousPrice');
        expect(price).toHaveProperty('market');
        expect(price).toHaveProperty('unit');
        expect(price).toHaveProperty('trend');
        expect(price).toHaveProperty('changePercent');
      });
    });

    it('filters market prices by crop', async () => {
      const result = await apiService.getMarketPrices('Rice');
      
      expect(Array.isArray(result)).toBe(true);
      result.forEach(price => {
        expect(price.crop.toLowerCase()).toContain('rice');
      });
    });
  });

  describe('getPestAlerts', () => {
    it('returns pest alerts', async () => {
      const result = await apiService.getPestAlerts();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(alert => {
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('crop');
        expect(alert).toHaveProperty('pest');
        expect(alert).toHaveProperty('malayalam');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('description');
        expect(alert).toHaveProperty('affectedAreas');
        expect(alert).toHaveProperty('recommendedAction');
      });
    });

    it('filters pest alerts by crop', async () => {
      const result = await apiService.getPestAlerts('Rice');
      
      expect(Array.isArray(result)).toBe(true);
      result.forEach(alert => {
        expect(alert.crop.toLowerCase()).toContain('rice');
      });
    });

    it('filters pest alerts by district', async () => {
      const result = await apiService.getPestAlerts(undefined, 'Kottayam');
      
      expect(Array.isArray(result)).toBe(true);
      result.forEach(alert => {
        expect(alert.affectedAreas.some(area => 
          area.toLowerCase().includes('kottayam')
        )).toBe(true);
      });
    });
  });

  describe('getGovernmentAdvisories', () => {
    it('returns government advisories', async () => {
      const result = await apiService.getGovernmentAdvisories();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(advisory => {
        expect(advisory).toHaveProperty('id');
        expect(advisory).toHaveProperty('title');
        expect(advisory).toHaveProperty('malayalam');
        expect(advisory).toHaveProperty('description');
        expect(advisory).toHaveProperty('type');
        expect(advisory).toHaveProperty('priority');
        expect(advisory).toHaveProperty('source');
      });
    });
  });

  describe('getSoilHealthData', () => {
    it('returns soil health data', async () => {
      const result = await apiService.getSoilHealthData(10.0, 76.0);
      
      expect(result).toHaveProperty('pH');
      expect(result).toHaveProperty('organicMatter');
      expect(result).toHaveProperty('nitrogen');
      expect(result).toHaveProperty('phosphorus');
      expect(result).toHaveProperty('potassium');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('getCropCalendar', () => {
    it('returns crop calendar for known crops', async () => {
      const riceCalendar = await apiService.getCropCalendar('Rice', 'Kerala');
      const coconutCalendar = await apiService.getCropCalendar('Coconut', 'Kerala');
      
      expect(riceCalendar).not.toBeNull();
      expect(riceCalendar).toHaveProperty('sowing');
      expect(riceCalendar).toHaveProperty('transplanting');
      expect(riceCalendar).toHaveProperty('harvesting');
      expect(riceCalendar).toHaveProperty('activities');
      
      expect(coconutCalendar).not.toBeNull();
      expect(coconutCalendar).toHaveProperty('planting');
      expect(coconutCalendar).toHaveProperty('flowering');
      expect(coconutCalendar).toHaveProperty('harvesting');
    });

    it('returns null for unknown crops', async () => {
      const result = await apiService.getCropCalendar('UnknownCrop', 'Kerala');
      
      expect(result).toBeNull();
    });
  });
});
