import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  DollarSign,
  Bell,
  Filter,
  Search
} from 'lucide-react';
import BackButton from './BackButton';
import { ActivityTask } from '../types/farmer';

interface ActivityTrackingProps {
  onBack?: () => void;
}

export default function ActivityTracking({ onBack }: ActivityTrackingProps) {
  const [activities, setActivities] = useState<ActivityTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityTask | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    priority: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [newActivity, setNewActivity] = useState({
    type: 'sowing' as const,
    title: '',
    description: '',
    scheduledDate: '',
    priority: 'medium' as const,
    notes: '',
    cost: 0
  });

  const activityTypes = [
    { value: 'sowing', label: 'Sowing', icon: '🌱' },
    { value: 'irrigation', label: 'Irrigation', icon: '💧' },
    { value: 'fertilizer', label: 'Fertilizer', icon: '🌿' },
    { value: 'pesticide', label: 'Pesticide', icon: '🛡️' },
    { value: 'weeding', label: 'Weeding', icon: '🌾' },
    { value: 'harvest', label: 'Harvest', icon: '🌾' },
    { value: 'pruning', label: 'Pruning', icon: '✂️' },
    { value: 'spraying', label: 'Spraying', icon: '💨' }
  ];

  useEffect(() => {
    fetchActivities();
  }, [filter, searchTerm]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Mock API call - in production, this would call the actual backend
      const mockActivities: ActivityTask[] = [
        {
          id: '1',
          farmerId: '1',
          type: 'sowing',
          title: 'Rice Sowing - Field A',
          description: 'Sow rice seeds in Field A with proper spacing',
          date: new Date().toISOString(),
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'high',
          notes: 'Use certified seeds',
          cost: 5000,
          location: {
            latitude: 9.9312,
            longitude: 76.2673,
            address: 'Field A, Kumarakom'
          },
          attachments: [],
          reminders: [
            {
              type: 'push',
              scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              sent: false
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          farmerId: '1',
          type: 'irrigation',
          title: 'Water Field B',
          description: 'Irrigate Field B with proper water management',
          date: new Date().toISOString(),
          scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'overdue',
          priority: 'urgent',
          notes: 'Field is drying up',
          cost: 200,
          location: {
            latitude: 9.9312,
            longitude: 76.2673,
            address: 'Field B, Kumarakom'
          },
          attachments: [],
          reminders: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          farmerId: '1',
          type: 'fertilizer',
          title: 'Apply NPK Fertilizer',
          description: 'Apply NPK fertilizer to all rice fields',
          date: new Date().toISOString(),
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'medium',
          notes: 'Use organic fertilizer if available',
          cost: 3000,
          location: {
            latitude: 9.9312,
            longitude: 76.2673,
            address: 'All Fields, Kumarakom'
          },
          attachments: [],
          reminders: [
            {
              type: 'push',
              scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              sent: false
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Filter activities
      let filteredActivities = mockActivities;
      
      if (filter.status !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.status === filter.status);
      }
      
      if (filter.type !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.type === filter.type);
      }
      
      if (filter.priority !== 'all') {
        filteredActivities = filteredActivities.filter(activity => activity.priority === filter.priority);
      }
      
      if (searchTerm) {
        filteredActivities = filteredActivities.filter(activity => 
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.description) {
      alert('Please fill in title and description');
      return;
    }

    try {
      // Mock API call - in production, this would call the actual backend
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newActivity)
      });

      if (response.ok) {
        // Reset form
        setNewActivity({
          type: 'sowing',
          title: '',
          description: '',
          scheduledDate: '',
          priority: 'medium',
          notes: '',
          cost: 0
        });
        setShowCreateForm(false);
        
        // Refresh activities
        fetchActivities();
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity. Please try again.');
    }
  };

  const handleUpdateStatus = async (activityId: string, status: ActivityTask['status']) => {
    try {
      // Mock API call
      const response = await fetch(`/api/activities/${activityId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Update local state
        setActivities(prev => prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status, updatedAt: new Date().toISOString() }
            : activity
        ));
      }
    } catch (error) {
      console.error('Error updating activity status:', error);
    }
  };

  const getStatusIcon = (status: ActivityTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ActivityTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ActivityTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActivityStats = () => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'completed').length;
    const pending = activities.filter(a => a.status === 'pending').length;
    const overdue = activities.filter(a => a.status === 'overdue').length;
    const inProgress = activities.filter(a => a.status === 'in-progress').length;

    return { total, completed, pending, overdue, inProgress };
  };

  const stats = getActivityStats();

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Tracking</h2>
          <p className="text-gray-600">Manage your farm activities and track progress</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <select
              value={filter.priority}
              onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {activityTypes.find(t => t.value === activity.type)?.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(activity.status)}
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Scheduled: {formatDate(activity.scheduledDate || activity.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(activity.priority)}`}>
                    {activity.priority} priority
                  </span>
                </div>
                {activity.cost > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>₹{activity.cost}</span>
                  </div>
                )}
              </div>

              {activity.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{activity.location.address}</span>
                </div>
              )}

              {activity.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">{activity.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {activity.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(activity.id, 'in-progress')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {activity.status === 'in-progress' && (
                    <button
                      onClick={() => handleUpdateStatus(activity.id, 'completed')}
                      className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  {activity.status === 'overdue' && (
                    <button
                      onClick={() => handleUpdateStatus(activity.id, 'in-progress')}
                      className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      Resume
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {activity.reminders.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Bell className="h-4 w-4" />
                      <span>{activity.reminders.length}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedActivity(activity)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Activity Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add New Activity</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Type *
                    </label>
                    <select
                      value={newActivity.type}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {activityTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={newActivity.priority}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter activity title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe the activity..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={newActivity.scheduledDate}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={newActivity.cost}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateActivity}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
