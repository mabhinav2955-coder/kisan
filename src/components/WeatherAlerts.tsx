import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  AlertTriangle, 
  Thermometer, 
  Droplets,
  RefreshCw,
  Calendar,
  MapPin,
  Clock,
  X
} from 'lucide-react';
import BackButton from './BackButton';
import { WeatherAlert } from '../types/farmer';

interface WeatherAlertsProps {
  onBack?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function WeatherAlerts({ onBack, isOpen, onClose }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherAlerts();
  }, []);

  const fetchWeatherAlerts = async () => {
    try {
      setLoading(true);
      // Mock API call - in production, this would call the actual backend
      const mockAlerts: WeatherAlert[] = [
        {
          id: '1',
          type: 'rainfall',
          severity: 'high',
          title: 'Heavy Rainfall Warning',
          description: 'Heavy rainfall expected in your area for the next 3 days. Take necessary precautions for your crops.',
          affectedAreas: ['Kottayam', 'Alappuzha', 'Pathanamthitta'],
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          recommendations: [
            'Drain excess water from fields',
            'Cover harvested crops',
            'Avoid spraying pesticides during rain',
            'Check irrigation systems'
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'heatwave',
          severity: 'medium',
          title: 'Heat Wave Alert',
          description: 'High temperature conditions expected. Take care of your crops and livestock.',
          affectedAreas: ['Thrissur', 'Palakkad', 'Malappuram'],
          validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          validTo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          recommendations: [
            'Increase irrigation frequency',
            'Provide shade for livestock',
            'Mulch around plants',
            'Water early morning or evening'
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'wind',
          severity: 'urgent',
          title: 'Strong Wind Warning',
          description: 'Strong winds up to 60 km/h expected. Secure your farm equipment and structures.',
          affectedAreas: ['Kochi', 'Thiruvananthapuram', 'Kollam'],
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          recommendations: [
            'Secure farm equipment',
            'Check greenhouse structures',
            'Harvest ripe crops if possible',
            'Avoid working in open fields'
          ],
          createdAt: new Date().toISOString()
        }
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      setError('Failed to fetch weather alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'rainfall':
        return <CloudRain className="h-6 w-6 text-blue-600" />;
      case 'heatwave':
        return <Sun className="h-6 w-6 text-orange-600" />;
      case 'wind':
        return <Wind className="h-6 w-6 text-gray-600" />;
      case 'storm':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'drought':
        return <Droplets className="h-6 w-6 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isActive = (alert: WeatherAlert) => {
    const now = new Date();
    const validFrom = new Date(alert.validFrom);
    const validTo = new Date(alert.validTo);
    return now >= validFrom && now <= validTo;
  };

  const content = (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weather Alerts</h2>
          <p className="text-gray-600">Stay updated with weather conditions affecting your farm</p>
        </div>
        <button
          onClick={fetchWeatherAlerts}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Sun className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Weather Alerts</h3>
              <p className="text-gray-600">All clear! No weather warnings for your area.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                  isActive(alert) ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        {isActive(alert) && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{alert.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Affected Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {alert.affectedAreas.map(area => (
                        <span key={area} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Valid Period</h4>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>From: {formatDate(alert.validFrom)}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>To: {formatDate(alert.validTo)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {alert.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Weather Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Current Weather Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Thermometer className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">28°C</div>
            <div className="text-sm opacity-90">Temperature</div>
          </div>
          <div className="text-center">
            <Droplets className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">65%</div>
            <div className="text-sm opacity-90">Humidity</div>
          </div>
          <div className="text-center">
            <Wind className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">12 km/h</div>
            <div className="text-sm opacity-90">Wind Speed</div>
          </div>
          <div className="text-center">
            <CloudRain className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">Sunny</div>
            <div className="text-sm opacity-90">Condition</div>
          </div>
        </div>
      </div>
    </div>
  );

  // If used as modal
  if (isOpen && onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Weather Alerts</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  // If used as page component
  return content;
}
