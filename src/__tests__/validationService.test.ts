import { validationService } from '../services/validationService';

describe('ValidationService', () => {
  describe('validateFarmerProfile', () => {
    it('validates correct farmer profile data', () => {
      const validData = {
        name: 'John Doe',
        phone: '9876543210',
        village: 'Test Village',
        district: 'Test District'
      };

      const result = validationService.validateFarmerProfile(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid phone number', () => {
      const invalidData = {
        name: 'John Doe',
        phone: '1234567890', // Invalid: doesn't start with 6-9
        village: 'Test Village',
        district: 'Test District'
      };

      const result = validationService.validateFarmerProfile(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Phone number must be 10 digits starting with 6-9');
    });

    it('rejects empty required fields', () => {
      const invalidData = {
        name: '',
        phone: '',
        village: '',
        district: ''
      };

      const result = validationService.validateFarmerProfile(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects name with invalid characters', () => {
      const invalidData = {
        name: 'John123@Doe',
        phone: '9876543210',
        village: 'Test Village',
        district: 'Test District'
      };

      const result = validationService.validateFarmerProfile(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be 2-50 characters and contain only letters');
    });
  });

  describe('validateFarmDetails', () => {
    it('validates correct farm details', () => {
      const validData = {
        landSize: 5.5,
        soilType: 'loamy',
        irrigationMethod: 'drip',
        location: {
          pincode: '123456'
        },
        crops: [
          {
            name: 'Rice',
            area: 2.5,
            plantingDate: '2024-01-01',
            expectedHarvestDate: '2024-06-01'
          }
        ]
      };

      const result = validationService.validateFarmDetails(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid land size', () => {
      const invalidData = {
        landSize: -5,
        soilType: 'loamy',
        irrigationMethod: 'drip',
        location: { pincode: '123456' },
        crops: []
      };

      const result = validationService.validateFarmDetails(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Land size must be a positive number');
    });

    it('rejects invalid soil type', () => {
      const invalidData = {
        landSize: 5,
        soilType: 'invalid',
        irrigationMethod: 'drip',
        location: { pincode: '123456' },
        crops: []
      };

      const result = validationService.validateFarmDetails(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please select a valid soil type');
    });

    it('rejects invalid pincode', () => {
      const invalidData = {
        landSize: 5,
        soilType: 'loamy',
        irrigationMethod: 'drip',
        location: { pincode: '12345' }, // Invalid: 5 digits
        crops: []
      };

      const result = validationService.validateFarmDetails(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pincode must be 6 digits');
    });

    it('rejects empty crops array', () => {
      const invalidData = {
        landSize: 5,
        soilType: 'loamy',
        irrigationMethod: 'drip',
        location: { pincode: '123456' },
        crops: []
      };

      const result = validationService.validateFarmDetails(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one crop must be added');
    });
  });

  describe('validateCrop', () => {
    it('validates correct crop data', () => {
      const validData = {
        name: 'Rice',
        area: 2.5,
        plantingDate: '2024-01-01',
        expectedHarvestDate: '2024-06-01'
      };

      const result = validationService.validateCrop(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid area', () => {
      const invalidData = {
        name: 'Rice',
        area: -2.5,
        plantingDate: '2024-01-01',
        expectedHarvestDate: '2024-06-01'
      };

      const result = validationService.validateCrop(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Crop area must be a positive number');
    });

    it('rejects harvest date before planting date', () => {
      const invalidData = {
        name: 'Rice',
        area: 2.5,
        plantingDate: '2024-06-01',
        expectedHarvestDate: '2024-01-01'
      };

      const result = validationService.validateCrop(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Harvest date must be after planting date');
    });
  });

  describe('validateActivity', () => {
    it('validates correct activity data', () => {
      const validData = {
        type: 'sowing',
        description: 'Planting rice seeds in the field',
        date: '2024-01-01',
        cost: 1000
      };

      const result = validationService.validateActivity(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid activity type', () => {
      const invalidData = {
        type: 'invalid',
        description: 'Planting rice seeds in the field',
        date: '2024-01-01'
      };

      const result = validationService.validateActivity(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please select a valid activity type');
    });

    it('rejects short description', () => {
      const invalidData = {
        type: 'sowing',
        description: 'Short',
        date: '2024-01-01'
      };

      const result = validationService.validateActivity(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be 10-200 characters');
    });

    it('rejects negative cost', () => {
      const invalidData = {
        type: 'sowing',
        description: 'Planting rice seeds in the field',
        date: '2024-01-01',
        cost: -1000
      };

      const result = validationService.validateActivity(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cost must be a positive number');
    });
  });

  describe('utility functions', () => {
    it('validates email format', () => {
      expect(validationService.validateEmail('test@example.com')).toBe(true);
      expect(validationService.validateEmail('invalid-email')).toBe(false);
      expect(validationService.validateEmail('test@')).toBe(false);
    });

    it('validates phone number format', () => {
      expect(validationService.validatePhone('9876543210')).toBe(true);
      expect(validationService.validatePhone('1234567890')).toBe(false);
      expect(validationService.validatePhone('987654321')).toBe(false);
    });

    it('validates pincode format', () => {
      expect(validationService.validatePincode('123456')).toBe(true);
      expect(validationService.validatePincode('12345')).toBe(false);
      expect(validationService.validatePincode('012345')).toBe(false);
    });

    it('validates coordinates', () => {
      expect(validationService.validateCoordinates(10.0, 76.0)).toBe(true);
      expect(validationService.validateCoordinates(91.0, 76.0)).toBe(false);
      expect(validationService.validateCoordinates(10.0, 181.0)).toBe(false);
      expect(validationService.validateCoordinates(NaN, 76.0)).toBe(false);
    });

    it('validates date range', () => {
      expect(validationService.validateDateRange('2024-01-01', '2024-06-01')).toBe(true);
      expect(validationService.validateDateRange('2024-06-01', '2024-01-01')).toBe(false);
      expect(validationService.validateDateRange('invalid', '2024-06-01')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('removes potentially dangerous content', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = validationService.sanitizeInput(input);
      
      expect(sanitized).toBe('scriptalert("xss")/scriptHello World');
    });

    it('trims whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = validationService.sanitizeInput(input);
      
      expect(sanitized).toBe('Hello World');
    });

    it('handles non-string input', () => {
      const input = null as any;
      const sanitized = validationService.sanitizeInput(input);
      
      expect(sanitized).toBe('');
    });
  });
});
