import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  badge?: string;
}

export default function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  badge 
}: FeatureCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-green-200 transition-all transform hover:scale-105 group"
    >
      <div className="relative h-32 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
        <Icon className="h-12 w-12 text-green-600" />
        {badge && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              {badge}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}