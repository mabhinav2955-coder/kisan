import React from 'react';
import { MapPin, Ruler, Droplets, Mountain } from 'lucide-react';
import { Farm } from '../types/farmer';

interface FarmProfileCardProps {
  farm: Farm;
  onEditClick: () => void;
}

const getSoilTypeDisplay = (soilType: string) => {
  const types = {
    clay: 'Clay Soil',
    sandy: 'Sandy Soil',
    loamy: 'Loamy Soil',
    red: 'Red Soil',
    black: 'Black Soil'
  };
  return types[soilType as keyof typeof types] || soilType;
};

const getIrrigationDisplay = (type: string) => {
  const types = {
    'rain-fed': 'Rain-fed',
    'bore-well': 'Bore Well',
    'canal': 'Canal',
    'drip': 'Drip Irrigation',
    'sprinkler': 'Sprinkler'
  };
  return types[type as keyof typeof types] || type;
};

export default function FarmProfileCard({ farm, onEditClick }: FarmProfileCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Farm Profile</h3>
        <button
          onClick={onEditClick}
          className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Edit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <div className="text-sm">
            <div className="font-medium text-gray-900">{farm.location.village}</div>
            <div className="text-gray-600">{farm.location.district}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <div className="text-sm">
            <div className="font-medium text-gray-900">{farm.landSize} acres</div>
            <div className="text-gray-600">Total land</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Mountain className="h-4 w-4 text-gray-500" />
          <div className="text-sm">
            <div className="font-medium text-gray-900">{getSoilTypeDisplay(farm.soilType)}</div>
            <div className="text-gray-600">Soil type</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-gray-500" />
          <div className="text-sm">
            <div className="font-medium text-gray-900">{getIrrigationDisplay(farm.irrigationType)}</div>
            <div className="text-gray-600">Irrigation</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Crops</h4>
        <div className="space-y-2">
          {farm.crops.map((crop) => (
            <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{crop.name}</div>
                <div className="text-sm text-gray-600">{crop.variety} • {crop.area} acres</div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                crop.status === 'growing' ? 'bg-green-100 text-green-800' :
                crop.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                crop.status === 'harvested' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {crop.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}