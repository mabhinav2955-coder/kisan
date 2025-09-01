import React from 'react';
import { Sprout, Droplets, Zap, Shield, Scissors, Package } from 'lucide-react';
import { Activity } from '../types/farmer';

interface ActivityCardProps {
  activity: Activity;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sowing': return <Sprout className="h-5 w-5 text-green-600" />;
    case 'irrigation': return <Droplets className="h-5 w-5 text-blue-600" />;
    case 'fertilizer': return <Zap className="h-5 w-5 text-yellow-600" />;
    case 'pesticide': return <Shield className="h-5 w-5 text-red-600" />;
    case 'weeding': return <Scissors className="h-5 w-5 text-purple-600" />;
    case 'harvest': return <Package className="h-5 w-5 text-orange-600" />;
    default: return <Sprout className="h-5 w-5 text-gray-600" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'sowing': return 'bg-green-50 border-green-200';
    case 'irrigation': return 'bg-blue-50 border-blue-200';
    case 'fertilizer': return 'bg-yellow-50 border-yellow-200';
    case 'pesticide': return 'bg-red-50 border-red-200';
    case 'weeding': return 'bg-purple-50 border-purple-200';
    case 'harvest': return 'bg-orange-50 border-orange-200';
    default: return 'bg-gray-50 border-gray-200';
  }
};

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${getActivityColor(activity.type)} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {getActivityIcon(activity.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900 capitalize">{activity.type}</h4>
            <span className="text-xs text-gray-500">
              {new Date(activity.date).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
          
          {activity.notes && (
            <p className="text-xs text-gray-600 italic mb-2">{activity.notes}</p>
          )}
          
          {activity.cost && (
            <div className="text-xs text-green-700 font-medium">
              Cost: ₹{activity.cost.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}