import React from 'react';
import { TrendingUp, Target, Award, Calendar, BarChart3 } from 'lucide-react';
import { Activity, Crop } from '../types/farmer';

interface ProgressTrackerProps {
  activities: Activity[];
  crops: Crop[];
}

export default function ProgressTracker({ activities, crops }: ProgressTrackerProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear;
  });

  const totalCost = activities
    .filter(a => a.cost)
    .reduce((sum, a) => sum + (a.cost || 0), 0);

  const activityTypes = ['sowing', 'irrigation', 'fertilizer', 'pesticide', 'weeding', 'harvest'];
  const activityCounts = activityTypes.map(type => ({
    type,
    count: activities.filter(a => a.type === type).length,
    thisMonth: monthlyActivities.filter(a => a.type === type).length
  }));

  const cropProgress = crops.map(crop => {
    const cropActivities = activities.filter(a => a.cropId === crop.id);
    const completionPercentage = Math.min((cropActivities.length / 8) * 100, 100); // Assuming 8 activities per crop cycle
    
    return {
      ...crop,
      activitiesCount: cropActivities.length,
      completionPercentage
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center shadow-sm">
          <BarChart3 className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Progress Tracker</h2>
          <p className="text-gray-600">Monitor your farming activities and crop progress</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{activities.length}</div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{monthlyActivities.length}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">₹{totalCost.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Investment</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{crops.filter(c => c.status === 'growing').length}</div>
              <div className="text-sm text-gray-600">Active Crops</div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Progress</h3>
        <div className="space-y-4">
          {cropProgress.map((crop) => (
            <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{crop.name}</h4>
                  <p className="text-sm text-gray-600">{crop.variety} • {crop.area} acres</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {Math.round(crop.completionPercentage)}% Complete
                  </div>
                  <div className="text-xs text-gray-500">
                    {crop.activitiesCount} activities logged
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${crop.completionPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  crop.status === 'growing' ? 'bg-green-100 text-green-800' :
                  crop.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                  crop.status === 'harvested' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {crop.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activityCounts.map((activity) => (
            <div key={activity.type} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{activity.count}</div>
              <div className="text-sm text-gray-600 capitalize mb-1">{activity.type}</div>
              <div className="text-xs text-green-600">
                {activity.thisMonth} this month
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Farming Achievements</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold mb-1">{activities.length}</div>
            <div className="text-sm text-green-100">Activities Logged</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold mb-1">{crops.length}</div>
            <div className="text-sm text-green-100">Crops Managed</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold mb-1">
              {Math.round(activities.length / Math.max(1, Math.ceil((Date.now() - new Date(crops[0]?.plantingDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 7))))}
            </div>
            <div className="text-sm text-green-100">Avg Activities/Week</div>
          </div>
        </div>
      </div>
    </div>
  );
}