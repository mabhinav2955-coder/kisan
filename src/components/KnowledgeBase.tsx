import React, { useState, useEffect } from 'react';
import { Book, Search, Calendar, Bug, Leaf, Droplets, ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react';
import BackButton from './BackButton';
import { apiService, PestAlert, GovernmentAdvisory } from '../services/apiService';

interface KnowledgeItem {
  id: string;
  title: string;
  malayalam: string;
  category: 'crop-calendar' | 'pest-management' | 'nutrition' | 'irrigation' | 'general';
  description: string;
  content: string;
}

const knowledgeItems: KnowledgeItem[] = [
  {
    id: '1',
    title: 'Rice Crop Calendar for Kerala',
    malayalam: 'കേരളത്തിലെ നെല്ല് വിള കലണ്ടർ',
    category: 'crop-calendar',
    description: 'Complete guide for rice cultivation in Kerala including planting and harvesting seasons',
    content: 'Detailed rice cultivation calendar...'
  },
  {
    id: '2',
    title: 'Brown Plant Hopper Management',
    malayalam: 'ബ്രൗൺ പ്ലാന്റ് ഹോപ്പർ നിയന്ത്രണം',
    category: 'pest-management',
    description: 'Identification and management strategies for brown plant hopper in rice',
    content: 'BPH management guide...'
  },
  {
    id: '3',
    title: 'Coconut Nutrition Management',
    malayalam: 'തെങ്ങിന്റെ പോഷക പരിപാലനം',
    category: 'nutrition',
    description: 'Essential nutrients and fertilizer recommendations for coconut palms',
    content: 'Coconut nutrition guide...'
  },
  {
    id: '4',
    title: 'Water Management in Monsoon',
    malayalam: 'മൺസൂണിലെ ജല പരിപാലനം',
    category: 'irrigation',
    description: 'Best practices for water management during monsoon season',
    content: 'Monsoon water management...'
  }
];

const categories = [
  { id: 'all', label: 'All Topics', icon: Book },
  { id: 'crop-calendar', label: 'Crop Calendar', icon: Calendar },
  { id: 'pest-management', label: 'Pest Management', icon: Bug },
  { id: 'nutrition', label: 'Plant Nutrition', icon: Leaf },
  { id: 'irrigation', label: 'Water Management', icon: Droplets }
];

interface KnowledgeBaseProps {
  onBack?: () => void;
}

export default function KnowledgeBase({ onBack }: KnowledgeBaseProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [pestAlerts, setPestAlerts] = useState<PestAlert[]>([]);
  const [governmentAdvisories, setGovernmentAdvisories] = useState<GovernmentAdvisory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRealTimeData();
  }, []);

  const fetchRealTimeData = async () => {
    setLoading(true);
    try {
      const [pestData, advisoryData] = await Promise.all([
        apiService.getPestAlerts(),
        apiService.getGovernmentAdvisories()
      ]);
      setPestAlerts(pestData);
      setGovernmentAdvisories(advisoryData);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.malayalam.includes(searchTerm) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Knowledge Base
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.title}</h2>
          <p className="text-lg text-gray-600 mb-4">{selectedItem.malayalam}</p>
          <div className="prose max-w-none">
            <p className="text-gray-700">{selectedItem.description}</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                This would contain the full detailed content for {selectedItem.title}. 
                In a real application, this would include comprehensive farming guidance, 
                step-by-step instructions, images, and videos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
          <Book className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Base</h2>
          <p className="text-gray-600">Access expert farming knowledge and best practices</p>
        </div>
      </div>

      {/* Real-time Alerts */}
      {pestAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Live Pest Alerts</h3>
            </div>
            <button
              onClick={fetchRealTimeData}
              disabled={loading}
              className="p-1 text-red-600 hover:text-red-700 transition-colors"
              title="Refresh alerts"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-2">
            {pestAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.pest}</h4>
                    <p className="text-sm text-gray-600">{alert.malayalam}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                <p className="text-xs text-gray-600">
                  <strong>Action:</strong> {alert.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Government Advisories */}
      {governmentAdvisories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Book className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Government Advisories</h3>
            </div>
            <button
              onClick={fetchRealTimeData}
              disabled={loading}
              className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
              title="Refresh advisories"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-2">
            {governmentAdvisories.slice(0, 2).map((advisory) => (
              <div key={advisory.id} className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{advisory.title}</h4>
                    <p className="text-sm text-gray-600">{advisory.malayalam}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(advisory.priority)}`}>
                    {advisory.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{advisory.description}</p>
                <p className="text-xs text-gray-600">
                  <strong>Source:</strong> {advisory.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search knowledge base..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Knowledge Items */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-green-200 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{item.malayalam}</p>
                <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors ml-3" />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.category === 'crop-calendar' ? 'bg-blue-100 text-blue-800' :
                item.category === 'pest-management' ? 'bg-red-100 text-red-800' :
                item.category === 'nutrition' ? 'bg-green-100 text-green-800' :
                item.category === 'irrigation' ? 'bg-cyan-100 text-cyan-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {categories.find(c => c.id === item.category)?.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Book className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No knowledge items found for your search.</p>
        </div>
      )}
    </div>
  );
}