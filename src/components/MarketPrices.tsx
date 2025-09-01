import React from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';

interface MarketPrice {
  crop: string;
  malayalam: string;
  currentPrice: number;
  previousPrice: number;
  market: string;
  date: string;
  unit: string;
}

const marketPrices: MarketPrice[] = [
  {
    crop: 'Rice',
    malayalam: 'നെല്ല്',
    currentPrice: 2850,
    previousPrice: 2800,
    market: 'Kottayam Mandi',
    date: new Date().toISOString().split('T')[0],
    unit: 'quintal'
  },
  {
    crop: 'Coconut',
    malayalam: 'തെങ്ങ്',
    currentPrice: 12,
    previousPrice: 11.5,
    market: 'Cochin Market',
    date: new Date().toISOString().split('T')[0],
    unit: 'piece'
  },
  {
    crop: 'Pepper',
    malayalam: 'കുരുമുളക്',
    currentPrice: 45000,
    previousPrice: 46500,
    market: 'Idukki Spice Market',
    date: new Date().toISOString().split('T')[0],
    unit: 'quintal'
  },
  {
    crop: 'Cardamom',
    malayalam: 'ഏലം',
    currentPrice: 275000,
    previousPrice: 270000,
    market: 'Kumily Market',
    date: new Date().toISOString().split('T')[0],
    unit: 'quintal'
  },
  {
    crop: 'Rubber',
    malayalam: 'റബ്ബർ',
    currentPrice: 18500,
    previousPrice: 18200,
    market: 'Rubber Board',
    date: new Date().toISOString().split('T')[0],
    unit: 'quintal'
  },
  {
    crop: 'Banana',
    malayalam: 'വാഴ',
    currentPrice: 2200,
    previousPrice: 2200,
    market: 'Ernakulam Market',
    date: new Date().toISOString().split('T')[0],
    unit: 'quintal'
  }
];

export default function MarketPrices() {
  const getPriceChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    
    if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-600', sign: '+', percentage };
    } else if (change < 0) {
      return { icon: TrendingDown, color: 'text-red-600', sign: '', percentage };
    } else {
      return { icon: Minus, color: 'text-gray-600', sign: '', percentage: '0.0' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Prices</h2>
          <p className="text-gray-600">Live prices from Kerala markets</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {marketPrices.map((item, index) => {
          const priceChange = getPriceChange(item.currentPrice, item.previousPrice);
          const ChangeIcon = priceChange.icon;
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.crop}</h3>
                  <p className="text-sm text-gray-600">{item.malayalam}</p>
                </div>
                <div className={`flex items-center space-x-1 ${priceChange.color}`}>
                  <ChangeIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {priceChange.sign}{priceChange.percentage}%
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{item.currentPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per {item.unit}</div>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{item.market}</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Previous: ₹{item.previousPrice.toLocaleString()}/{item.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Market Insights</h4>
            <p className="text-sm text-blue-700 mt-1">
              Rice prices are trending upward due to seasonal demand. Consider timing your harvest for better returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}