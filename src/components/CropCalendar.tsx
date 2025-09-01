import React, { useState } from 'react';
import { Calendar, Sprout, Droplets, Zap, Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface CropCalendarEvent {
  id: string;
  title: string;
  malayalam: string;
  date: string;
  type: 'sowing' | 'irrigation' | 'fertilizer' | 'harvest' | 'pest-control';
  crop: string;
  description: string;
  completed: boolean;
}

const calendarEvents: CropCalendarEvent[] = [
  {
    id: '1',
    title: 'Rice Transplanting',
    malayalam: 'നെല്ല് നടീൽ',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'sowing',
    crop: 'Rice',
    description: 'Optimal time for rice transplanting in Kottayam region',
    completed: false
  },
  {
    id: '2',
    title: 'Coconut Fertilizer Application',
    malayalam: 'തെങ്ങിന് വളം',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'fertilizer',
    crop: 'Coconut',
    description: 'Apply organic manure around coconut trees',
    completed: false
  },
  {
    id: '3',
    title: 'Rice Field Irrigation',
    malayalam: 'നെല്ല് വയലിൽ വെള്ളം',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'irrigation',
    crop: 'Rice',
    description: 'Maintain 2-3 cm water level in rice fields',
    completed: false
  },
  {
    id: '4',
    title: 'Pest Inspection',
    malayalam: 'കീട പരിശോധന',
    date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'pest-control',
    crop: 'Rice',
    description: 'Check for brown plant hopper and stem borer',
    completed: false
  }
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'sowing': return <Sprout className="h-4 w-4" />;
    case 'irrigation': return <Droplets className="h-4 w-4" />;
    case 'fertilizer': return <Zap className="h-4 w-4" />;
    case 'harvest': return <Package className="h-4 w-4" />;
    case 'pest-control': return <Calendar className="h-4 w-4" />;
    default: return <Calendar className="h-4 w-4" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'sowing': return 'bg-green-100 text-green-800 border-green-200';
    case 'irrigation': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'fertilizer': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'harvest': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'pest-control': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function CropCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(calendarEvents);

  const toggleEventCompletion = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
          <Calendar className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Crop Calendar</h2>
          <p className="text-gray-600">Plan and track your farming activities</p>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Upcoming Activities</h4>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                  event.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg border ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className={`font-medium ${event.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {event.title}
                      </h5>
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{event.malayalam}</p>
                    <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Crop: {event.crop}</span>
                      <button
                        onClick={() => toggleEventCompletion(event.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          event.completed
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {event.completed ? 'Mark Pending' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Smart Calendar Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Activities are automatically scheduled based on your crops and local conditions</li>
              <li>• Weather alerts will adjust your calendar recommendations</li>
              <li>• Complete activities to track your farming progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}