import React from 'react';
import { Calendar, Sprout, Droplets, Zap, Package, CheckCircle, Clock } from 'lucide-react';
import { FarmDetails } from '../types/farmer';

interface ActivityOutlineGeneratorProps {
  farmDetails: FarmDetails;
  onGenerateActivities: (activities: any[]) => void;
}

interface GeneratedActivity {
  id: string;
  type: 'sowing' | 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'harvest';
  title: string;
  malayalam: string;
  description: string;
  suggestedDate: string;
  crop: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  tools: string[];
}

export default function ActivityOutlineGenerator({ farmDetails, onGenerateActivities }: ActivityOutlineGeneratorProps) {
  const generateActivities = () => {
    const activities: GeneratedActivity[] = [];
    const currentDate = new Date();

    farmDetails.crops.forEach((crop, cropIndex) => {
      const plantingDate = new Date(crop.plantingDate);
      const harvestDate = new Date(crop.expectedHarvestDate);
      
      // Pre-planting activities
      if (crop.status === 'planning') {
        activities.push({
          id: `prep-${cropIndex}-1`,
          type: 'weeding',
          title: `Land Preparation - ${crop.name}`,
          malayalam: `നിലം തയ്യാറാക്കൽ - ${crop.name}`,
          description: `Prepare the land for ${crop.name} cultivation. Clear weeds, plow, and level the field.`,
          suggestedDate: new Date(plantingDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          crop: crop.name,
          priority: 'high',
          estimatedDuration: '2-3 days',
          tools: ['Plow', 'Harrow', 'Leveler']
        });

        activities.push({
          id: `prep-${cropIndex}-2`,
          type: 'fertilizer',
          title: `Soil Testing - ${crop.name}`,
          malayalam: `മണ്ണ് പരിശോധന - ${crop.name}`,
          description: `Test soil pH and nutrient levels for ${crop.name} cultivation.`,
          suggestedDate: new Date(plantingDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          crop: crop.name,
          priority: 'medium',
          estimatedDuration: '1 day',
          tools: ['Soil testing kit', 'pH meter']
        });
      }

      // Planting activities
      if (crop.status === 'planning' || crop.status === 'planted') {
        activities.push({
          id: `plant-${cropIndex}-1`,
          type: 'sowing',
          title: `Planting - ${crop.name}`,
          malayalam: `നടീൽ - ${crop.name}`,
          description: `Plant ${crop.name} seeds/seedlings in prepared field.`,
          suggestedDate: crop.plantingDate,
          crop: crop.name,
          priority: 'high',
          estimatedDuration: '1-2 days',
          tools: ['Seeds/Seedlings', 'Planting tools', 'Measuring tape']
        });
      }

      // Growing season activities
      if (crop.status === 'planted' || crop.status === 'growing') {
        // Irrigation schedule based on irrigation method
        const irrigationFrequency = farmDetails.irrigationMethod === 'drip' ? 2 : 
                                   farmDetails.irrigationMethod === 'sprinkler' ? 3 : 5;
        
        for (let i = 1; i <= 4; i++) {
          activities.push({
            id: `irrig-${cropIndex}-${i}`,
            type: 'irrigation',
            title: `Irrigation - ${crop.name} (Week ${i})`,
            malayalam: `നീരൊഴുക്ക് - ${crop.name} (ആഴ്ച ${i})`,
            description: `Apply irrigation to ${crop.name} field. Check soil moisture levels.`,
            suggestedDate: new Date(plantingDate.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            crop: crop.name,
            priority: 'high',
            estimatedDuration: '2-4 hours',
            tools: farmDetails.irrigationMethod === 'drip' ? ['Drip system', 'Timer'] :
                   farmDetails.irrigationMethod === 'sprinkler' ? ['Sprinkler system'] :
                   ['Water source', 'Hose', 'Bucket']
          });
        }

        // Fertilizer application
        activities.push({
          id: `fert-${cropIndex}-1`,
          type: 'fertilizer',
          title: `First Fertilizer Application - ${crop.name}`,
          malayalam: `ആദ്യ വളപ്രയോഗം - ${crop.name}`,
          description: `Apply first round of fertilizer to ${crop.name} after 2 weeks of planting.`,
          suggestedDate: new Date(plantingDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          crop: crop.name,
          priority: 'high',
          estimatedDuration: '1 day',
          tools: ['Fertilizer', 'Spreader', 'Gloves', 'Mask']
        });

        // Pest control
        activities.push({
          id: `pest-${cropIndex}-1`,
          type: 'pesticide',
          title: `Pest Inspection - ${crop.name}`,
          malayalam: `കീട പരിശോധന - ${crop.name}`,
          description: `Inspect ${crop.name} for common pests and diseases. Apply treatment if needed.`,
          suggestedDate: new Date(plantingDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          crop: crop.name,
          priority: 'medium',
          estimatedDuration: '2-3 hours',
          tools: ['Magnifying glass', 'Pest identification guide', 'Pesticides']
        });

        // Weeding
        activities.push({
          id: `weed-${cropIndex}-1`,
          type: 'weeding',
          title: `Weeding - ${crop.name}`,
          malayalam: `കളനീക്കൽ - ${crop.name}`,
          description: `Remove weeds from ${crop.name} field to prevent competition.`,
          suggestedDate: new Date(plantingDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          crop: crop.name,
          priority: 'medium',
          estimatedDuration: '1-2 days',
          tools: ['Hoe', 'Hand tools', 'Weed control spray']
        });
      }

      // Harvest activities
      if (crop.status === 'growing' || crop.status === 'harvested') {
        activities.push({
          id: `harvest-${cropIndex}-1`,
          type: 'harvest',
          title: `Harvest - ${crop.name}`,
          malayalam: `വിളവെടുപ്പ് - ${crop.name}`,
          description: `Harvest ${crop.name} when ready. Check for optimal harvest time.`,
          suggestedDate: crop.expectedHarvestDate,
          crop: crop.name,
          priority: 'high',
          estimatedDuration: '2-3 days',
          tools: ['Harvesting tools', 'Containers', 'Storage bags']
        });
      }
    });

    // Sort activities by suggested date
    activities.sort((a, b) => new Date(a.suggestedDate).getTime() - new Date(b.suggestedDate).getTime());
    
    onGenerateActivities(activities);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sowing': return <Sprout className="h-4 w-4" />;
      case 'irrigation': return <Droplets className="h-4 w-4" />;
      case 'fertilizer': return <Zap className="h-4 w-4" />;
      case 'pesticide': return <Package className="h-4 w-4" />;
      case 'weeding': return <CheckCircle className="h-4 w-4" />;
      case 'harvest': return <Package className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activity Outline Generator</h3>
            <p className="text-gray-600">Generate personalized farming activities based on your farm details</p>
          </div>
          <button
            onClick={generateActivities}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Generate Activities</span>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Activities are generated based on your crop types and planting dates</li>
                <li>• Timing considers your soil type and irrigation method</li>
                <li>• You can customize or modify any generated activity</li>
                <li>• Activities are prioritized based on crop growth stages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
