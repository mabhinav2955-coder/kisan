import React from 'react';
import { Menu, Bell, User, MessageCircle, Wifi, WifiOff, LogOut } from 'lucide-react';

interface HeaderProps {
  farmerName: string;
  onLogout: () => void;
  onMenuClick: () => void;
  onChatClick: () => void;
  onNotificationClick: () => void;
  unreadNotifications: number;
}

export default function Header({ farmerName, onLogout, onMenuClick, onChatClick, onNotificationClick, unreadNotifications }: HeaderProps) {
  const [isOnline] = React.useState(true);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">KS</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Krishi Sakhi</h1>
                <p className="text-xs text-gray-500">Your Farming Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onChatClick}
              className="p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors relative"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
            
            <button 
              onClick={onNotificationClick}
              className="p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors relative"
            >
              <Bell className="h-6 w-6" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{farmerName}</p>
                <p className="text-xs text-gray-500">Farmer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}