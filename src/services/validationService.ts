// Validation service for farmer input and form data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Validate farmer profile data
  validateFarmerProfile(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'name',
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s\u0D00-\u0D7F]+$/,
        message: 'Name must be 2-50 characters and contain only letters'
      },
      {
        field: 'phone',
        required: true,
        pattern: /^[6-9]\d{9}$/,
        message: 'Phone number must be 10 digits starting with 6-9'
      },
      {
        field: 'village',
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Village name is required'
      },
      {
        field: 'district',
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'District name is required'
      }
    ];

    return this.validate(data, rules);
  }

  // Validate farm details
  validateFarmDetails(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'landSize',
        required: true,
        custom: (value) => {
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            return 'Land size must be a positive number';
          }
          if (num > 1000) {
            return 'Land size seems too large. Please verify the value';
          }
          return null;
        }
      },
      {
        field: 'soilType',
        required: true,
        custom: (value) => {
          const validTypes = ['clay', 'sandy', 'loamy', 'red', 'black', 'alluvial'];
          if (!validTypes.includes(value)) {
            return 'Please select a valid soil type';
          }
          return null;
        }
      },
      {
        field: 'irrigationMethod',
        required: true,
        custom: (value) => {
          const validMethods = ['rain-fed', 'bore-well', 'canal', 'drip', 'sprinkler', 'flood'];
          if (!validMethods.includes(value)) {
            return 'Please select a valid irrigation method';
          }
          return null;
        }
      },
      {
        field: 'location.pincode',
        required: true,
        pattern: /^[1-9][0-9]{5}$/,
        message: 'Pincode must be 6 digits'
      },
      {
        field: 'crops',
        required: true,
        custom: (value) => {
          if (!Array.isArray(value) || value.length === 0) {
            return 'At least one crop must be added';
          }
          return null;
        }
      }
    ];

    return this.validate(data, rules);
  }

  // Validate crop data
  validateCrop(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'name',
        required: true,
        minLength: 2,
        maxLength: 30,
        message: 'Crop name is required'
      },
      {
        field: 'area',
        required: true,
        custom: (value) => {
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            return 'Crop area must be a positive number';
          }
          if (num > 100) {
            return 'Crop area seems too large. Please verify the value';
          }
          return null;
        }
      },
      {
        field: 'plantingDate',
        required: true,
        custom: (value) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Please select a valid planting date';
          }
          const today = new Date();
          if (date > today) {
            return 'Planting date cannot be in the future';
          }
          return null;
        }
      },
      {
        field: 'expectedHarvestDate',
        required: true,
        custom: (value) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Please select a valid harvest date';
          }
          const plantingDate = new Date(data.plantingDate);
          if (date <= plantingDate) {
            return 'Harvest date must be after planting date';
          }
          return null;
        }
      }
    ];

    return this.validate(data, rules);
  }

  // Validate activity data
  validateActivity(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'type',
        required: true,
        custom: (value) => {
          const validTypes = ['sowing', 'irrigation', 'fertilizer', 'pesticide', 'weeding', 'harvest'];
          if (!validTypes.includes(value)) {
            return 'Please select a valid activity type';
          }
          return null;
        }
      },
      {
        field: 'description',
        required: true,
        minLength: 10,
        maxLength: 200,
        message: 'Description must be 10-200 characters'
      },
      {
        field: 'date',
        required: true,
        custom: (value) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Please select a valid date';
          }
          return null;
        }
      },
      {
        field: 'cost',
        custom: (value) => {
          if (value !== undefined && value !== null && value !== '') {
            const num = parseFloat(value);
            if (isNaN(num) || num < 0) {
              return 'Cost must be a positive number';
            }
            if (num > 100000) {
              return 'Cost seems too high. Please verify the value';
            }
          }
          return null;
        }
      }
    ];

    return this.validate(data, rules);
  }

  // Generic validation function
  validate(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const value = this.getNestedValue(data, rule.field);
      const fieldName = rule.field.split('.').pop() || rule.field;

      // Required validation
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${fieldName} is required`);
        continue;
      }

      // Skip other validations if value is empty and not required
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Min length validation
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(rule.message || `${fieldName} must be at least ${rule.minLength} characters`);
      }

      // Max length validation
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`);
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(rule.message || `${fieldName} format is invalid`);
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Get nested value from object
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Sanitize input data
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Validate phone number (Indian format)
  validatePhone(phone: string): boolean {
    const phonePattern = /^[6-9]\d{9}$/;
    return phonePattern.test(phone.replace(/\D/g, ''));
  }

  // Validate pincode (Indian format)
  validatePincode(pincode: string): boolean {
    const pincodePattern = /^[1-9][0-9]{5}$/;
    return pincodePattern.test(pincode.replace(/\D/g, ''));
  }

  // Validate coordinates
  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }

  // Validate date range
  validateDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime());
  }

  // Get validation summary
  getValidationSummary(result: ValidationResult): string {
    if (result.isValid) {
      return 'All validations passed';
    }

    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;

    let summary = `${errorCount} error${errorCount !== 1 ? 's' : ''}`;
    if (warningCount > 0) {
      summary += ` and ${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
    }

    return summary;
  }
}

// Create singleton instance
export const validationService = ValidationService.getInstance();
