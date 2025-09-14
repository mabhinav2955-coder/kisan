import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Loader2, X, MapPin, Leaf, Calendar } from 'lucide-react';
import BackButton from './BackButton';
import { DiseaseReport, ImageFile } from '../types/farmer';

interface CropDoctorProps {
  onBack?: () => void;
}

export default function CropDoctor({ onBack }: CropDoctorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    cropName: '',
    cropVariety: '',
    symptoms: '',
    severity: 'moderate' as 'mild' | 'moderate' | 'severe',
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      pincode: ''
    }
  });
  const [analysisResult, setAnalysisResult] = useState<DiseaseReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          setError('Unable to get location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (!formData.cropName) {
      setError('Please enter the crop name');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      // Add other form data
      formDataToSend.append('cropName', formData.cropName);
      formDataToSend.append('cropVariety', formData.cropVariety);
      formDataToSend.append('symptoms', formData.symptoms);
      formDataToSend.append('severity', formData.severity);
      formDataToSend.append('location', JSON.stringify(formData.location));

      // Mock API call - in production, this would call the actual backend
      const response = await fetch('/api/diseases/analyze', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result.analysis);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Unable to detect disease. Please try again with a clearer picture.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setImages([]);
    setPreviewUrls([]);
    setFormData({
      cropName: '',
      cropVariety: '',
      symptoms: '',
      severity: 'moderate',
      location: {
        latitude: 0,
        longitude: 0,
        address: '',
        pincode: ''
      }
    });
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crop Doctor</h2>
          <p className="text-gray-600">Upload plant images for AI-powered disease detection</p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <Leaf className="h-6 w-6" />
          <span className="font-medium">AI Powered</span>
        </div>
      </div>

      {!analysisResult ? (
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Plant Images</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span>Take Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload from Gallery</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500">
                Upload 1-5 clear images of the affected plant parts. Maximum 5MB per image.
              </p>
            </div>
          </div>

          {/* Crop Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Name *
                </label>
                <input
                  type="text"
                  value={formData.cropName}
                  onChange={(e) => setFormData(prev => ({ ...prev, cropName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Rice, Tomato, Coconut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Variety
                </label>
                <input
                  type="text"
                  value={formData.cropVariety}
                  onChange={(e) => setFormData(prev => ({ ...prev, cropVariety: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Basmati, Cherry Tomato"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms Observed
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the symptoms you've observed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.location.pincode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, pincode: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Pincode"
                  />
                  <button
                    onClick={getCurrentLocation}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>GPS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || images.length === 0}
              className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Leaf className="h-5 w-5" />
                  <span>Analyze Disease</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>New Analysis</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {analysisResult.aiAnalysis.diseaseDetected}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Confidence: {analysisResult.aiAnalysis.confidence}%
                  </p>
                </div>
              </div>

              {analysisResult.aiAnalysis.alternativeDiagnoses && analysisResult.aiAnalysis.alternativeDiagnoses.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Alternative Diagnoses:</h5>
                  <div className="space-y-1">
                    {analysisResult.aiAnalysis.alternativeDiagnoses.map((alt, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {alt.disease} ({alt.confidence}% confidence)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {analysisResult.recommendations && (
            <div className="space-y-4">
              {/* Organic Treatments */}
              {analysisResult.recommendations.organic.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-green-800 mb-4">🌱 Organic Treatments</h4>
                  <div className="space-y-3">
                    {analysisResult.recommendations.organic.map((treatment, index) => (
                      <div key={index} className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-medium text-green-900">{treatment.treatment}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                          <div><span className="font-medium">Dosage:</span> {treatment.dosage}</div>
                          <div><span className="font-medium">Frequency:</span> {treatment.frequency}</div>
                          <div><span className="font-medium">Duration:</span> {treatment.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chemical Treatments */}
              {analysisResult.recommendations.chemical.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4">⚠️ Chemical Treatments</h4>
                  <div className="space-y-3">
                    {analysisResult.recommendations.chemical.map((treatment, index) => (
                      <div key={index} className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-medium text-orange-900">{treatment.treatment}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                          <div><span className="font-medium">Dosage:</span> {treatment.dosage}</div>
                          <div><span className="font-medium">Frequency:</span> {treatment.frequency}</div>
                          <div><span className="font-medium">Duration:</span> {treatment.duration}</div>
                        </div>
                        {treatment.safetyNotes && (
                          <div className="mt-2 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                            <strong>Safety Notes:</strong> {treatment.safetyNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preventive Measures */}
              {analysisResult.recommendations.preventive.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">🛡️ Preventive Measures</h4>
                  <div className="space-y-3">
                    {analysisResult.recommendations.preventive.map((measure, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900">{measure.measure}</h5>
                        <p className="text-sm text-blue-800 mt-1">{measure.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
