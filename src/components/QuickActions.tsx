import React from 'react';
import { Plus, Calendar, Camera, FileText, TrendingUp, Settings, Smartphone, Bell } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const actions = [
  { id: 'log-activity', label: 'Log Activity', icon: Plus, color: 'bg-green-500 hover:bg-green-600' },
  { id: 'view-calendar', label: 'Crop Calendar', icon: Calendar, color: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'take-photo', label: 'Crop Photo', icon: Camera, color: 'bg-purple-500 hover:bg-purple-600' },
  { id: 'view-reports', label: 'Reports', icon: FileText, color: 'bg-amber-500 hover:bg-amber-600' },
  { id: 'market-prices', label: 'Market Prices', icon: TrendingUp, color: 'bg-orange-500 hover:bg-orange-600' },
  { id: 'weather-alerts', label: 'Weather Alerts', icon: Bell, color: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'crop-doctor', label: 'Crop Doctor', icon: Camera, color: 'bg-red-500 hover:bg-red-600' },
  { id: 'community', label: 'Community', icon: Smartphone, color: 'bg-indigo-500 hover:bg-indigo-600' }
];

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center space-y-2 transition-all transform hover:scale-105 hover:shadow-lg`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}