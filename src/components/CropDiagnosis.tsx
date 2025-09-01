import React, { useState } from 'react';
import { Camera, Upload, X, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';

interface CropDiagnosisProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiagnosisResult {
  disease: string;
  malayalam: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string[];
  prevention: string[];
}

export default function CropDiagnosis({ isOpen, onClose }: CropDiagnosisProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeCrop = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setDiagnosis({
        disease: 'Brown Spot Disease',
        malayalam: 'ബ്രൗൺ സ്പോട്ട് രോഗം',
        confidence: 87,
        severity: 'medium',
        treatment: [
          'Apply copper-based fungicide',
          'Improve field drainage',
          'Remove affected leaves'
        ],
        prevention: [
          'Use resistant varieties',
          'Maintain proper spacing',
          'Avoid over-irrigation'
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Camera className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crop Doctor</h3>
              <p className="text-sm text-gray-600">AI-powered crop disease diagnosis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!selectedImage ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Crop Image</h4>
              <p className="text-gray-600 mb-6">Take a photo of your crop to get instant AI diagnosis</p>
              
              <div className="space-y-3">
                <label className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  <Camera className="h-5 w-5" />
                  <span>Take Photo</span>
                  <input type="file" accept="image/*" capture="camera" onChange={handleImageUpload} className="hidden" />
                </label>
                
                <div className="text-gray-500">or</div>
                
                <label className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="h-5 w-5" />
                  <span>Upload from Gallery</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Uploaded crop" 
                  className="w-full h-64 object-cover rounded-lg shadow-sm"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDiagnosis(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 rounded-full text-gray-600 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!diagnosis && !isAnalyzing && (
                <button
                  onClick={analyzeCrop}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Analyze Crop Health
                </button>
              )}

              {isAnalyzing && (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your crop image...</p>
                </div>
              )}

              {diagnosis && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <div>
                        <h4 className="font-semibold text-red-900">{diagnosis.disease}</h4>
                        <p className="text-sm text-red-700">{diagnosis.malayalam}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {diagnosis.confidence}% confident
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                        <Leaf className="h-4 w-4 mr-2" />
                        Treatment
                      </h5>
                      <ul className="space-y-2">
                        {diagnosis.treatment.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-medium text-green-900 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Prevention
                      </h5>
                      <ul className="space-y-2">
                        {diagnosis.prevention.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}