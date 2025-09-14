// Error handling service for consistent error management across the app

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export class ErrorService {
  private static instance: ErrorService;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  // Create a standardized error
  createError(
    code: string, 
    message: string, 
    details?: any, 
    context?: string
  ): AppError {
    const error: AppError = {
      code,
      message,
      details,
      timestamp: new Date(),
      context
    };

    this.logError(error);
    return error;
  }

  // Log error for debugging and monitoring
  private logError(error: AppError) {
    this.errorLog.push(error);
    
    // In production, send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(error);
    }

    // Keep only last 100 errors in memory
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  // Send error to external monitoring service
  private sendToMonitoringService(error: AppError) {
    // In a real app, this would send to Sentry, LogRocket, etc.
    console.log('Error sent to monitoring service:', error);
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: AppError): string {
    const errorMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Unable to connect to the internet. Please check your connection and try again.',
      'API_ERROR': 'Unable to fetch data from the server. Please try again later.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'AUTH_ERROR': 'Authentication failed. Please log in again.',
      'PERMISSION_ERROR': 'You do not have permission to perform this action.',
      'NOT_FOUND': 'The requested information could not be found.',
      'TIMEOUT_ERROR': 'The request took too long to complete. Please try again.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
      'VOICE_ERROR': 'Voice feature is not available. Please type your message.',
      'STORAGE_ERROR': 'Unable to save data locally. Some features may not work offline.',
      'WEATHER_ERROR': 'Weather data is temporarily unavailable.',
      'MARKET_ERROR': 'Market prices are temporarily unavailable.',
      'PEST_ALERT_ERROR': 'Pest alert data is temporarily unavailable.',
      'GOVERNMENT_ADVISORY_ERROR': 'Government advisories are temporarily unavailable.'
    };

    return errorMessages[error.code] || errorMessages['UNKNOWN_ERROR'];
  }

  // Handle API errors
  handleApiError(error: any, context?: string): AppError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return this.createError('NETWORK_ERROR', 'Network connection failed', error, context);
    }
    
    if (error.status === 401) {
      return this.createError('AUTH_ERROR', 'Authentication required', error, context);
    }
    
    if (error.status === 403) {
      return this.createError('PERMISSION_ERROR', 'Access denied', error, context);
    }
    
    if (error.status === 404) {
      return this.createError('NOT_FOUND', 'Resource not found', error, context);
    }
    
    if (error.status >= 500) {
      return this.createError('API_ERROR', 'Server error', error, context);
    }
    
    if (error.name === 'AbortError') {
      return this.createError('TIMEOUT_ERROR', 'Request timeout', error, context);
    }

    return this.createError('API_ERROR', error.message || 'API request failed', error, context);
  }

  // Handle validation errors
  handleValidationError(field: string, message: string): AppError {
    return this.createError('VALIDATION_ERROR', `${field}: ${message}`, { field });
  }

  // Handle voice errors
  handleVoiceError(error: any, context?: string): AppError {
    if (error.name === 'NotAllowedError') {
      return this.createError('VOICE_ERROR', 'Microphone permission denied', error, context);
    }
    
    if (error.name === 'NotSupportedError') {
      return this.createError('VOICE_ERROR', 'Voice features not supported', error, context);
    }

    return this.createError('VOICE_ERROR', 'Voice processing failed', error, context);
  }

  // Handle storage errors
  handleStorageError(error: any, context?: string): AppError {
    return this.createError('STORAGE_ERROR', 'Local storage failed', error, context);
  }

  // Get error history
  getErrorHistory(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error history
  clearErrorHistory(): void {
    this.errorLog = [];
  }

  // Check if error is recoverable
  isRecoverableError(error: AppError): boolean {
    const recoverableCodes = [
      'NETWORK_ERROR',
      'API_ERROR',
      'TIMEOUT_ERROR',
      'WEATHER_ERROR',
      'MARKET_ERROR',
      'PEST_ALERT_ERROR',
      'GOVERNMENT_ADVISORY_ERROR'
    ];
    
    return recoverableCodes.includes(error.code);
  }

  // Get retry delay for error
  getRetryDelay(error: AppError): number {
    const retryDelays: Record<string, number> = {
      'NETWORK_ERROR': 5000,      // 5 seconds
      'API_ERROR': 10000,         // 10 seconds
      'TIMEOUT_ERROR': 3000,      // 3 seconds
      'WEATHER_ERROR': 30000,     // 30 seconds
      'MARKET_ERROR': 30000,      // 30 seconds
      'PEST_ALERT_ERROR': 60000,  // 1 minute
      'GOVERNMENT_ADVISORY_ERROR': 60000 // 1 minute
    };

    return retryDelays[error.code] || 5000;
  }
}

// Create singleton instance
export const errorService = ErrorService.getInstance();
