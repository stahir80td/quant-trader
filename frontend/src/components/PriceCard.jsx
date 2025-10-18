import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PriceCard({ price }) {
  const [priceChange, setPriceChange] = useState(0);
  const [prevPrice, setPrevPrice] = useState(price);

  useEffect(() => {
    if (prevPrice !== 0 && price !== 0) {
      setPriceChange(price - prevPrice);
    }
    setPrevPrice(price);
  }, [price]);

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-slate-400 text-sm">LIVE PRICE</div>
          <div className="text-5xl font-bold font-mono">
            ${price ? price.toFixed(2) : '0.00'}
          </div>
          <div className={`text-lg flex items-center gap-2 ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} (last tick)
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-sm">24H VOLUME</div>
          <div className="text-2xl font-bold">$24.5B</div>
          <div className="flex items-center gap-2 text-green-400 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      {/* Mini Chart Visualization */}
      <div className="bg-slate-800 rounded p-4 h-32 relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around px-2">
          {[...Array(50)].map((_, i) => {
            const height = 30 + Math.random() * 70;
            return (
              <div 
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t opacity-70"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}