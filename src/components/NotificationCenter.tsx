import React, { useState } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Heavy Rain Alert',
    message: 'Heavy rainfall expected for next 3 days. Postpone pesticide spraying.',
    type: 'warning',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'PM-KISAN Deadline Reminder',
    message: 'Only 10 days left to apply for PM-KISAN scheme. Apply now!',
    type: 'urgent',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '3',
    title: 'Rice Price Update',
    message: 'Rice prices increased by 2% in Kottayam market. Good time to sell!',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: '4',
    title: 'Soil Health Card Available',
    message: 'Your soil health card results are ready for download.',
    type: 'info',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'info': return <Info className="h-5 w-5 text-blue-600" />;
    default: return <Bell className="h-5 w-5 text-gray-600" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'warning': return 'bg-yellow-50 border-yellow-200';
    case 'urgent': return 'bg-red-50 border-red-200';
    case 'success': return 'bg-green-50 border-green-200';
    case 'info': return 'bg-blue-50 border-blue-200';
    default: return 'bg-gray-50 border-gray-200';
  }
};

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notificationList, setNotificationList] = useState(notifications);

  const markAsRead = (id: string) => {
    setNotificationList(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotificationList(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:w-96 sm:max-w-md h-full sm:h-[600px] sm:rounded-t-xl sm:rounded-b-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notificationList.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                getNotificationColor(notification.type)
              } ${!notification.read ? 'ring-2 ring-green-200' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    
                    {notification.actionUrl && (
                      <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Stay updated with personalized farming alerts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}