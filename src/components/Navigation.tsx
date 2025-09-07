import React from 'react';
import { 
  Home, 
  User, 
  Sprout, 
  Activity, 
  MessageSquare, 
  Bell, 
  TrendingUp,
  BookOpen,
  Award,
  BarChart3,
  X
} from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'farm', label: 'Farm Details', icon: Sprout },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'chat', label: 'Ask Krishi Sakhi', icon: MessageSquare },
  { id: 'advisories', label: 'Advisories', icon: Bell },
  { id: 'schemes', label: 'Govt Schemes', icon: Award },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'market', label: 'Market Prices', icon: TrendingUp },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen }
];

export default function Navigation({ isOpen, onClose, activeTab, onTabChange }: NavigationProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose}></div>}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">KS</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Krishi Sakhi</h2>
              <p className="text-xs text-gray-500">Farming Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium">Need Help?</p>
            <p className="text-xs text-green-600 mt-1">
              Tap the chat icon to talk to your Krishi Sakhi anytime!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}