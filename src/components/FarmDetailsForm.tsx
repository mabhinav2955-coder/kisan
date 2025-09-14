import React, { useState } from 'react';
import { MapPin, Droplets, Sprout, Save, X, Plus, Trash2 } from 'lucide-react';
import { FarmDetails } from '../types/farmer';

interface FarmDetailsFormProps {
  farmDetails?: FarmDetails;
  onSave: (farmDetails: FarmDetails) => void;
  onCancel: () => void;
}

const soilTypes = [
  { value: 'clay', label: 'Clay Soil', malayalam: 'ചെള്ള് മണ്ണ്' },
  { value: 'sandy', label: 'Sandy Soil', malayalam: 'മണൽ മണ്ണ്' },
  { value: 'loamy', label: 'Loamy Soil', malayalam: 'ചെള്ള് മണ്ണ്' },
  { value: 'red', label: 'Red Soil', malayalam: 'ചുവന്ന മണ്ണ്' },
  { value: 'black', label: 'Black Soil', malayalam: 'കറുത്ത മണ്ണ്' },
  { value: 'alluvial', label: 'Alluvial Soil', malayalam: 'അലുവിയൽ മണ്ണ്' }
];

const irrigationMethods = [
  { value: 'rain-fed', label: 'Rain-fed', malayalam: 'മഴയെ ആശ്രയിച്ച്' },
  { value: 'bore-well', label: 'Bore Well', malayalam: 'ബോർവെൽ' },
  { value: 'canal', label: 'Canal Irrigation', malayalam: 'കനാൽ നീരൊഴുക്ക്' },
  { value: 'drip', label: 'Drip Irrigation', malayalam: 'ഡ്രിപ്പ് നീരൊഴുക്ക്' },
  { value: 'sprinkler', label: 'Sprinkler', malayalam: 'സ്പ്രിങ്ക്ലർ' },
  { value: 'flood', label: 'Flood Irrigation', malayalam: 'വെള്ളപ്പൊക്ക നീരൊഴുക്ക്' }
];

const commonCrops = [
  'Rice', 'Coconut', 'Pepper', 'Cardamom', 'Rubber', 'Banana', 
  'Tapioca', 'Cashew', 'Mango', 'Jackfruit', 'Pineapple', 'Vegetables'
];

export default function FarmDetailsForm({ farmDetails, onSave, onCancel }: FarmDetailsFormProps) {
  const [formData, setFormData] = useState<FarmDetails>(
    farmDetails || {
      location: {
        latitude: 0,
        longitude: 0,
        pincode: '',
        address: ''
      },
      landSize: 0,
      soilType: 'loamy',
      irrigationMethod: 'rain-fed',
      crops: []
    }
  );

  const [newCrop, setNewCrop] = useState({
    name: '',
    variety: '',
    area: 0,
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'planning' as const
  });

  const handleSave = () => {
    onSave(formData);
  };

  const addCrop = () => {
    if (newCrop.name && newCrop.area > 0) {
      setFormData(prev => ({
        ...prev,
        crops: [...prev.crops, { ...newCrop, name: newCrop.name }]
      }));
      setNewCrop({
        name: '',
        variety: '',
        area: 0,
        plantingDate: '',
        expectedHarvestDate: '',
        status: 'planning'
      });
    }
  };

  const removeCrop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          alert('Unable to get location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode *
            </label>
            <input
              type="text"
              value={formData.location.pincode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, pincode: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter pincode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, address: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter farm address"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={getCurrentLocation}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>Get Current Location</span>
          </button>
          {(formData.location.latitude !== 0 || formData.location.longitude !== 0) && (
            <p className="text-sm text-gray-600 mt-2">
              Location: {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Land Size (acres) *
            </label>
            <input
              type="number"
              value={formData.landSize}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                landSize: parseFloat(e.target.value) || 0
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter land size in acres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soil Type *
            </label>
            <select
              value={formData.soilType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                soilType: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {soilTypes.map(soil => (
                <option key={soil.value} value={soil.value}>
                  {soil.label} - {soil.malayalam}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Irrigation Method *
            </label>
            <select
              value={formData.irrigationMethod}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                irrigationMethod: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {irrigationMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label} - {method.malayalam}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crops</h3>
        
        {/* Add New Crop */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Add New Crop</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Crop Name</label>
              <select
                value={newCrop.name}
                onChange={(e) => setNewCrop(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select crop</option>
                {commonCrops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Variety</label>
              <input
                type="text"
                value={newCrop.variety}
                onChange={(e) => setNewCrop(prev => ({ ...prev, variety: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                placeholder="Variety name"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Area (acres)</label>
              <input
                type="number"
                value={newCrop.area}
                onChange={(e) => setNewCrop(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Planting Date</label>
              <input
                type="date"
                value={newCrop.plantingDate}
                onChange={(e) => setNewCrop(prev => ({ ...prev, plantingDate: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expected Harvest</label>
              <input
                type="date"
                value={newCrop.expectedHarvestDate}
                onChange={(e) => setNewCrop(prev => ({ ...prev, expectedHarvestDate: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={addCrop}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Existing Crops */}
        <div className="space-y-2">
          {formData.crops.map((crop, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">{crop.name}</span>
                  <span className="text-sm text-gray-600">{crop.variety}</span>
                  <span className="text-sm text-gray-500">{crop.area} acres</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    crop.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    crop.status === 'planted' ? 'bg-blue-100 text-blue-800' :
                    crop.status === 'growing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {crop.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeCrop(index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Farm Details</span>
        </button>
      </div>
    </div>
  );
}
