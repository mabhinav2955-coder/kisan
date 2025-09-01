import React from 'react';
import { AlertTriangle, CloudRain, Bug, Leaf, Award, Clock } from 'lucide-react';
import { Advisory } from '../types/farmer';

interface AdvisoryCardProps {
  advisory: Advisory;
  onActionClick: (advisory: Advisory) => void;
}

const getAdvisoryIcon = (type: string) => {
  switch (type) {
    case 'weather': return <CloudRain className="h-5 w-5" />;
    case 'pest': return <Bug className="h-5 w-5" />;
    case 'nutrient': return <Leaf className="h-5 w-5" />;
    case 'scheme': return <Award className="h-5 w-5" />;
    default: return <AlertTriangle className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'weather': return 'text-blue-600';
    case 'pest': return 'text-red-600';
    case 'nutrient': return 'text-green-600';
    case 'scheme': return 'text-purple-600';
    default: return 'text-gray-600';
  }
};

export default function AdvisoryCard({ advisory, onActionClick }: AdvisoryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg bg-gray-50 ${getIconColor(advisory.type)}`}>
          {getAdvisoryIcon(advisory.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{advisory.title}</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(advisory.priority)}`}>
              {advisory.priority}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{advisory.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500 space-x-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(advisory.date).toLocaleDateString()}</span>
            </div>
            
            {advisory.actionRequired && (
              <button
                onClick={() => onActionClick(advisory)}
                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Take Action
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}