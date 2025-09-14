import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  ExternalLink, 
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import BackButton from './BackButton';
import { GovernmentScheme } from '../types/farmer';

interface GovernmentSchemesProps {
  onBack?: () => void;
}

export default function GovernmentSchemes({ onBack }: GovernmentSchemesProps) {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    type: 'all',
    category: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGovernmentSchemes();
  }, [filter, searchTerm]);

  const fetchGovernmentSchemes = async () => {
    try {
      setLoading(true);
      // Mock API call - in production, this would call the actual backend
      const mockSchemes: GovernmentScheme[] = [
        {
          id: '1',
          title: 'PM-KISAN Scheme',
          description: 'Direct income support of ₹6,000 per year to all farmer families.',
          type: 'subsidy',
          category: 'crop',
          eligibility: [
            'Small and marginal farmer families',
            'Landholding up to 2 hectares',
            'Valid land records'
          ],
          benefits: [
            '₹6,000 per year in 3 installments',
            'Direct bank transfer',
            'No middlemen involved'
          ],
          applicationDeadline: '2024-12-31',
          contactInfo: {
            phone: '1800-180-1551',
            email: 'pmkisan@gov.in',
            website: 'https://pmkisan.gov.in'
          },
          documentsRequired: [
            'Land ownership documents',
            'Bank account details',
            'Aadhaar card',
            'Mobile number'
          ],
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Pradhan Mantri Fasal Bima Yojana',
          description: 'Crop insurance scheme to protect farmers against crop loss.',
          type: 'insurance',
          category: 'crop',
          eligibility: [
            'All farmers growing notified crops',
            'Sharecroppers and tenant farmers',
            'Farmers growing crops in notified areas'
          ],
          benefits: [
            'Comprehensive risk coverage',
            'Low premium rates',
            'Quick claim settlement'
          ],
          applicationDeadline: '2024-03-31',
          contactInfo: {
            phone: '1800-180-1551',
            email: 'pmfby@gov.in',
            website: 'https://pmfby.gov.in'
          },
          documentsRequired: [
            'Land records',
            'Crop details',
            'Bank account details',
            'Premium payment proof'
          ],
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Kisan Credit Card',
          description: 'Flexible credit facility for farmers to meet their agricultural needs.',
          type: 'loan',
          category: 'general',
          eligibility: [
            'Farmers, tenant farmers, sharecroppers',
            'Self-help groups of farmers',
            'Joint liability groups'
          ],
          benefits: [
            'Flexible credit limit',
            'Low interest rates',
            'Easy repayment options'
          ],
          contactInfo: {
            phone: '1800-425-1551',
            email: 'kcc@gov.in',
            website: 'https://kcc.gov.in'
          },
          documentsRequired: [
            'Land ownership documents',
            'Income certificate',
            'Bank statements',
            'Identity proof'
          ],
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Soil Health Card Scheme',
          description: 'Free soil testing and recommendations for farmers.',
          type: 'training',
          category: 'crop',
          eligibility: [
            'All farmers',
            'Landowners and tenants',
            'Any agricultural land'
          ],
          benefits: [
            'Free soil testing',
            'Nutrient recommendations',
            'Crop-specific advice'
          ],
          applicationDeadline: '2024-06-30',
          contactInfo: {
            phone: '1800-180-1551',
            email: 'soilhealth@gov.in',
            website: 'https://soilhealth.dac.gov.in'
          },
          documentsRequired: [
            'Land ownership proof',
            'Contact details',
            'Crop details'
          ],
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Agricultural Equipment Subsidy',
          description: 'Subsidy for purchasing modern agricultural equipment.',
          type: 'subsidy',
          category: 'equipment',
          eligibility: [
            'Individual farmers',
            'Farmer groups',
            'Cooperative societies'
          ],
          benefits: [
            'Up to 50% subsidy on equipment',
            'Modern farming tools',
            'Increased productivity'
          ],
          applicationDeadline: '2024-04-15',
          contactInfo: {
            phone: '1800-180-1551',
            email: 'equipment@gov.in',
            website: 'https://equipment.gov.in'
          },
          documentsRequired: [
            'Equipment quotation',
            'Land records',
            'Bank details',
            'Farmer ID'
          ],
          status: 'upcoming',
          createdAt: new Date().toISOString()
        }
      ];

      // Filter schemes
      let filteredSchemes = mockSchemes;
      
      if (filter.type !== 'all') {
        filteredSchemes = filteredSchemes.filter(scheme => scheme.type === filter.type);
      }
      
      if (filter.category !== 'all') {
        filteredSchemes = filteredSchemes.filter(scheme => scheme.category === filter.category);
      }
      
      if (filter.status !== 'all') {
        filteredSchemes = filteredSchemes.filter(scheme => scheme.status === filter.status);
      }
      
      if (searchTerm) {
        filteredSchemes = filteredSchemes.filter(scheme => 
          scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setSchemes(filteredSchemes);
    } catch (error) {
      console.error('Error fetching government schemes:', error);
      setError('Failed to fetch government schemes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: GovernmentScheme['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'upcoming':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: GovernmentScheme['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: GovernmentScheme['type']) => {
    switch (type) {
      case 'subsidy':
        return 'bg-green-100 text-green-800';
      case 'insurance':
        return 'bg-blue-100 text-blue-800';
      case 'loan':
        return 'bg-purple-100 text-purple-800';
      case 'training':
        return 'bg-orange-100 text-orange-800';
      case 'equipment':
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

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffInDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 30 && diffInDays > 0;
  };

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Government Schemes & Benefits</h2>
          <p className="text-gray-600">Explore available government schemes and subsidies</p>
        </div>
        <button
          onClick={fetchGovernmentSchemes}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="subsidy">Subsidy</option>
              <option value="insurance">Insurance</option>
              <option value="loan">Loan</option>
              <option value="training">Training</option>
              <option value="equipment">Equipment</option>
            </select>
            <select
              value={filter.category}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="crop">Crop</option>
              <option value="livestock">Livestock</option>
              <option value="equipment">Equipment</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="general">General</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Schemes List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schemes Found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            schemes.map(scheme => (
              <div
                key={scheme.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
                  isDeadlineNear(scheme.applicationDeadline) ? 'border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(scheme.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{scheme.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scheme.status)}`}>
                          {scheme.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(scheme.type)}`}>
                          {scheme.type.toUpperCase()}
                        </span>
                        {isDeadlineNear(scheme.applicationDeadline) && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            DEADLINE NEAR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{scheme.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                    <ul className="space-y-1">
                      {scheme.eligibility.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                    <ul className="space-y-1">
                      {scheme.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {scheme.applicationDeadline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Application Deadline: {formatDate(scheme.applicationDeadline)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
                    <div className="flex flex-wrap gap-1">
                      {scheme.documentsRequired.map((doc, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {scheme.contactInfo.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{scheme.contactInfo.phone}</span>
                        </div>
                      )}
                      {scheme.contactInfo.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{scheme.contactInfo.email}</span>
                        </div>
                      )}
                      {scheme.contactInfo.website && (
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4" />
                          <a 
                            href={scheme.contactInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
