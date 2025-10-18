import React from 'react';
import { Activity } from 'lucide-react';

export default function RingBuffer({ bufferIndex }) {
  const totalSlots = 10; // Showing 10 slots for visualization (actual buffer is 1000)
  const displayIndex = bufferIndex % totalSlots;

  return (
    <div className="bg-slate-900 border-2 border-purple-500 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-purple-400" />
        <h2 className="text-xl font-bold">Ring Buffer</h2>
      </div>
      
      <div className="flex justify-center mb-4">
        <div className="relative w-48 h-48">
          {[...Array(totalSlots)].map((_, i) => {
            const angle = (i * 36) - 90;
            const x = 50 + 42 * Math.cos(angle * Math.PI / 180);
            const y = 50 + 42 * Math.sin(angle * Math.PI / 180);
            const isActive = i === displayIndex;
            const recentWrites = [
              displayIndex,
              (displayIndex - 1 + totalSlots) % totalSlots,
              (displayIndex - 2 + totalSlots) % totalSlots
            ];
            
            return (
              <div key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className={`relative w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-purple-500 border-purple-300 scale-125 shadow-lg shadow-purple-500/50' 
                    : recentWrites.includes(i)
                    ? 'bg-purple-700 border-purple-500'
                    : 'bg-slate-800 border-slate-600'
                }`}>
                  <span className={isActive ? 'text-white text-lg' : 'text-slate-400 text-sm'}>
                    {i}
                  </span>
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-xs text-slate-500">WRITE</div>
            <div className="text-2xl font-bold text-purple-400">
              {displayIndex}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded border-2 border-purple-300"></div>
          <span>Active write slot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-700 rounded border-2 border-purple-500"></div>
          <span>Recent writes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-800 rounded border-2 border-slate-600"></div>
          <span>Old data</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 mb-1">Buffer Stats</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-500">Capacity</div>
            <div className="font-bold text-purple-400">1000 slots</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-500">Current Index</div>
            <div className="font-bold text-purple-400">{bufferIndex}</div>
          </div>
        </div>
      </div>
    </div>
  );
}