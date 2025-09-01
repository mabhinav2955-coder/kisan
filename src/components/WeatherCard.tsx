import React from 'react';
import { Cloud, Sun, CloudRain, Droplets, Wind, Thermometer, Eye, Gauge } from 'lucide-react';

interface WeatherProps {
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    visibility: number;
    pressure: number;
    condition: string;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    rain: number;
  }>;
}

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
    case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
    case 'partly_cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
    default: return <Sun className="h-6 w-6 text-yellow-500" />;
  }
};

export default function WeatherCard({ current, forecast }: WeatherProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
        <div className="text-xs text-gray-500">Kumarakom, Kottayam</div>
      </div>

      {/* Current Weather */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <div className="flex items-center space-x-3">
          {getWeatherIcon(current.condition)}
          <div>
            <div className="text-2xl font-bold text-gray-900">{current.temperature}°C</div>
            <div className="text-sm text-gray-600">Partly Cloudy</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">{current.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{current.windSpeed} km/h</span>
          </div>
          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">{current.rainfall}mm</span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <span className="text-gray-600">Feels 30°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{current.visibility} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{current.pressure} mb</span>
          </div>
        </div>
      </div>

      {/* 4-Day Forecast */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">4-Day Forecast</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {forecast.map((day, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-xs font-medium text-gray-600 mb-2">{day.day}</div>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-sm font-semibold text-gray-900">{day.temp}°C</div>
              <div className="text-xs text-blue-600">{day.rain}% rain</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Insights */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Farming Recommendations</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>• Good conditions for field work today</p>
          <p>• Avoid spraying pesticides tomorrow due to expected rain</p>
          <p>• Ideal time for transplanting rice seedlings</p>
        </div>
      </div>
    </div>
  );
}