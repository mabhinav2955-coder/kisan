import React, { useState } from 'react';
import { Award, ExternalLink, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  malayalam: string;
  description: string;
  eligibility: string[];
  benefits: string;
  deadline: string;
  status: 'active' | 'applied' | 'expired' | 'upcoming';
  applicationUrl?: string;
  documents: string[];
}

const schemes: Scheme[] = [
  {
    id: '1',
    name: 'PM-KISAN Samman Nidhi',
    malayalam: 'പിഎം കിസാൻ സമ്മാൻ നിധി',
    description: 'Direct income support to farmers',
    eligibility: ['Small and marginal farmers', 'Land ownership documents required'],
    benefits: '₹6,000 per year in 3 installments',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    applicationUrl: 'https://pmkisan.gov.in',
    documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records']
  },
  {
    id: '2',
    name: 'Krishi Sinchai Yojana',
    malayalam: 'കൃഷി സിഞ്ചായി യോജന',
    description: 'Irrigation infrastructure development',
    eligibility: ['Farmers with irrigation needs', 'Group applications preferred'],
    benefits: 'Up to 90% subsidy for drip/sprinkler systems',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    documents: ['Land Records', 'Water Source Certificate', 'Group Formation Certificate']
  },
  {
    id: '3',
    name: 'Soil Health Card Scheme',
    malayalam: 'മണ്ണിന്റെ ആരോഗ്യ കാർഡ് പദ്ധതി',
    description: 'Free soil testing and nutrient recommendations',
    eligibility: ['All farmers', 'Every 3 years'],
    benefits: 'Free soil analysis and fertilizer recommendations',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'upcoming',
    documents: ['Farmer ID', 'Land Records']
  },
  {
    id: '4',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    malayalam: 'പ്രധാനമന്ത്രി ഫസൽ ബീമ യോജന',
    description: 'Crop insurance scheme',
    eligibility: ['All farmers', 'Covers major crops'],
    benefits: 'Crop loss compensation up to sum insured',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'applied',
    documents: ['Aadhaar Card', 'Bank Account', 'Sowing Certificate']
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'expired': return 'bg-red-100 text-red-800 border-red-200';
    case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <AlertCircle className="h-4 w-4" />;
    case 'applied': return <CheckCircle className="h-4 w-4" />;
    case 'expired': return <Clock className="h-4 w-4" />;
    case 'upcoming': return <Calendar className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

export default function SchemeAlerts() {
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const activeSchemes = schemes.filter(s => s.status === 'active' || s.status === 'upcoming');
  const appliedSchemes = schemes.filter(s => s.status === 'applied');

  if (selectedScheme) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedScheme(null)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Schemes
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedScheme.name}</h2>
              <p className="text-lg text-gray-600">{selectedScheme.malayalam}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedScheme.status)}`}>
              {getStatusIcon(selectedScheme.status)}
              <span className="ml-1 capitalize">{selectedScheme.status}</span>
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedScheme.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <p className="text-green-700 font-medium">{selectedScheme.benefits}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                <ul className="space-y-1">
                  {selectedScheme.eligibility.map((criteria, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Application Deadline</h4>
                <div className="flex items-center space-x-2 text-red-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{new Date(selectedScheme.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
                <ul className="space-y-1">
                  {selectedScheme.documents.map((doc, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-700">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedScheme.applicationUrl && selectedScheme.status === 'active' && (
                <div className="pt-4">
                  <a
                    href={selectedScheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center shadow-sm">
          <Award className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Government Schemes</h2>
          <p className="text-gray-600">Available schemes and benefits for farmers</p>
        </div>
      </div>

      {/* Active Schemes Alert */}
      {activeSchemes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Action Required</h4>
              <p className="text-sm text-amber-800 mt-1">
                You have {activeSchemes.length} scheme(s) with upcoming deadlines. Don't miss out on benefits!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Schemes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Schemes</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => setSelectedScheme(scheme)}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-green-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                    {scheme.name}
                  </h4>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(scheme.status)}`}>
                  {getStatusIcon(scheme.status)}
                  <span className="ml-1 capitalize">{scheme.status}</span>
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{scheme.malayalam}</p>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{scheme.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Benefits: {scheme.benefits.substring(0, 30)}...</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(scheme.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applied Schemes */}
      {appliedSchemes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applied Schemes</h3>
          <div className="space-y-3">
            {appliedSchemes.map((scheme) => (
              <div key={scheme.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-900">{scheme.name}</h4>
                  <p className="text-sm text-blue-700">{scheme.malayalam}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Applied
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}