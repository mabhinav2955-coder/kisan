import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import BackButton from './BackButton';
import { MarketPrice } from '../types/farmer';
import { apiService } from '../services/apiService';

// Remove the duplicate interface as it's now imported from apiService

interface MarketPricesProps {
  onBack?: () => void;
}

// Remove static data as we'll fetch from API

export default function MarketPrices({ onBack }: MarketPricesProps) {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchMarketPrices();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchMarketPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const prices = await apiService.getMarketPrices();
      setMarketPrices(prices);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch market prices. Please try again.');
      console.error('Error fetching market prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriceChange = (price: MarketPrice) => {
    const change = price.currentPrice - price.previousPrice;
    const percentage = price.changePercent;
    
    if (price.trend === 'up') {
      return { icon: TrendingUp, color: 'text-green-600', sign: '+', percentage: percentage.toFixed(1) };
    } else if (price.trend === 'down') {
      return { icon: TrendingDown, color: 'text-red-600', sign: '', percentage: percentage.toFixed(1) };
    } else {
      return { icon: Minus, color: 'text-gray-600', sign: '', percentage: '0.0' };
    }
  };

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
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
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchMarketPrices}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title="Refresh prices"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">Error loading market prices</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading && marketPrices.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
            <span className="text-gray-600">Loading market prices...</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketPrices.map((item, index) => {
            const priceChange = getPriceChange(item);
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
      )}

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