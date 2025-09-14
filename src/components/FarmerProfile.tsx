import React, { useState } from 'react';
import { User, Phone, MapPin, Calendar, Edit3, Save, X, Farm } from 'lucide-react';
import { Farmer } from '../types/farmer';
import BackButton from './BackButton';
import FarmDetailsForm from './FarmDetailsForm';

interface FarmerProfileProps {
  farmer: Farmer;
  onUpdate: (farmer: Farmer) => void;
  onBack?: () => void;
}

export default function FarmerProfile({ farmer, onUpdate, onBack }: FarmerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [formData, setFormData] = useState(farmer);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(farmer);
    setIsEditing(false);
  };

  const handleFarmDetailsSave = (farmDetails: any) => {
    setFormData(prev => ({ ...prev, farmDetails }));
    onUpdate({ ...formData, farmDetails });
    setIsEditingFarm(false);
  };

  const handleFarmDetailsCancel = () => {
    setIsEditingFarm(false);
  };

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-8 relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-xl font-semibold">{farmer.name}</h3>
              <p className="text-green-100">Registered Farmer</p>
              <div className="flex items-center space-x-1 mt-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Member since {new Date(farmer.registrationDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
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
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-medium text-gray-900">{farmer.name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone Number</div>
                    <div className="font-medium text-gray-900">{farmer.phone}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Village</div>
                    <div className="font-medium text-gray-900">{farmer.village}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">District</div>
                    <div className="font-medium text-gray-900">{farmer.district}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Farm Details Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Farm Details</h3>
            <button
              onClick={() => setIsEditingFarm(true)}
              className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              <Farm className="h-4 w-4" />
              <span>{farmer.farmDetails ? 'Edit' : 'Add'} Farm Details</span>
            </button>
          </div>

          {farmer.farmDetails ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Land Size:</span>
                  <span className="ml-2 text-gray-900">{farmer.farmDetails.landSize} acres</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Soil Type:</span>
                  <span className="ml-2 text-gray-900 capitalize">{farmer.farmDetails.soilType}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Irrigation:</span>
                  <span className="ml-2 text-gray-900 capitalize">{farmer.farmDetails.irrigationMethod}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Pincode:</span>
                  <span className="ml-2 text-gray-900">{farmer.farmDetails.location.pincode}</span>
                </div>
              </div>
              
              {farmer.farmDetails.crops.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Crops:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {farmer.farmDetails.crops.map((crop, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {crop.name} ({crop.area} acres)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <Farm className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-yellow-800 font-medium">No farm details added yet</p>
              <p className="text-yellow-700 text-sm">Add your farm details to get personalized recommendations</p>
            </div>
          )}
        </div>

        {/* Profile Completion */}
        <div className="px-6 pb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Profile Completion</span>
              <span className="text-sm font-bold text-green-800">
                {farmer.farmDetails ? '100%' : '60%'}
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: farmer.farmDetails ? '100%' : '60%' }}
              ></div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              {farmer.farmDetails 
                ? 'Your profile is complete! This helps us provide better recommendations.'
                : 'Add farm details to complete your profile and get better recommendations.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Farm Details Form Modal */}
      {isEditingFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Farm Details</h2>
                <button
                  onClick={handleFarmDetailsCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FarmDetailsForm
                farmDetails={farmer.farmDetails}
                onSave={handleFarmDetailsSave}
                onCancel={handleFarmDetailsCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}