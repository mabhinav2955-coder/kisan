import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Sparkles, Zap, Sprout, BookOpen, Award, Camera, Users } from 'lucide-react';
import WeatherCard from './WeatherCard';
import AdvisoryCard from './AdvisoryCard';
import ActivityCard from './ActivityCard';
import FarmProfileCard from './FarmProfileCard';
import QuickActions from './QuickActions';
import FeatureCard from './FeatureCard';
import EmptyState from './EmptyState';
import { Farm, Activity, Advisory } from '../types/farmer';
import { weatherData } from '../data/mockData';

interface DashboardProps {
  farm: Farm;
  activities: Activity[];
  advisories: Advisory[];
  onQuickAction: (action: string) => void;
  onAdvisoryAction: (advisory: Advisory) => void;
  onEditFarm: () => void;
}

export default function Dashboard({ 
  farm, 
  activities, 
  advisories, 
  onQuickAction, 
  onAdvisoryAction,
  onEditFarm 
}: DashboardProps) {
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  useEffect(() => {
    // Show welcome popup for 7 seconds after mount
    setShowWelcome(true);
    const t = setTimeout(() => setShowWelcome(false), 7000);
    return () => clearTimeout(t);
  }, []);
  const urgentAdvisories = advisories.filter(a => a.priority === 'urgent' || a.priority === 'high');
  const recentActivities = activities.slice(0, 3);
  
  const stats = [
    {
      label: 'Active Crops',
      value: farm.crops.filter(c => c.status === 'growing').length,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Pending Actions',
      value: urgentAdvisories.length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100'
    },
    {
      label: 'This Month Activities',
      value: activities.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length,
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Total Land',
      value: `${farm.landSize} acres`,
      icon: Clock,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="bg-white shadow-xl border border-green-200 rounded-xl px-6 py-4 flex items-center space-x-3 animate-fade-in">
            <Sprout className="h-6 w-6 text-green-600" />
            <div>
              <div className="font-semibold text-gray-900">Welcome back!</div>
              <div className="text-sm text-gray-600">Glad to see you again. Wishing you a great season! 🌾</div>
            </div>
          </div>
        </div>
      )}
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 rounded-xl text-white p-6 relative overflow-hidden">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-xl font-semibold">
              Welcome back, {farm.location.village} farmer! 🌾
            </h2>
            <Zap className="h-5 w-5 text-yellow-300" />
          </div>
          <p className="text-green-100 mb-3">
            Today is a good day for farming. Check your personalized recommendations below.
          </p>
          <div className="flex items-center space-x-4 text-sm text-green-100">
            <span>🌡️ {weatherData.current.temperature}°C</span>
            <span>💧 {weatherData.current.humidity}% humidity</span>
            <span>🌧️ {weatherData.forecast[0].rain}% rain chance</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather */}
          <WeatherCard current={weatherData.current} forecast={weatherData.forecast} />
          
          {/* Urgent Advisories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Priority Alerts</h3>
              <span className="text-sm text-red-600 font-medium">
                {urgentAdvisories.length} urgent
              </span>
            </div>
            
            <div className="space-y-3">
              {urgentAdvisories.length > 0 ? (
                urgentAdvisories.map((advisory) => (
                  <AdvisoryCard
                    key={advisory.id}
                    advisory={advisory}
                    onActionClick={onAdvisoryAction}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  title="All Clear!"
                  description="No urgent alerts. Your farm is doing well!"
                />
              )}
            </div>
          </div>
          
          {/* Featured Tools */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Tools</h3>
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                title="Crop Doctor"
                description="AI-powered crop disease diagnosis"
                icon={Camera}
                onClick={() => onQuickAction('crop-doctor')}
                badge="New"
              />
              <FeatureCard
                title="Community"
                description="Connect with local farmers"
                icon={Users}
                onClick={() => onQuickAction('community')}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Farm Profile */}
          <FarmProfileCard farm={farm} onEditClick={onEditFarm} />
          
          {/* Quick Actions */}
          <QuickActions onActionClick={onQuickAction} />
          
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button
                onClick={() => onQuickAction('view-all-activities')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}