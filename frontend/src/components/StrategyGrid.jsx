import React from 'react';
import { Zap } from 'lucide-react';

export default function StrategyGrid({ signals }) {
  const strategies = [
    { key: 'meanReversion', name: 'Mean Reversion', data: signals.meanReversion },
    { key: 'momentum', name: 'Momentum', data: signals.momentum },
    { key: 'breakout', name: 'Breakout', data: signals.breakout },
    { key: 'rsi', name: 'RSI', data: signals.rsi }
  ];

  const getColorClass = (type) => {
    switch (type) {
      case 'BUY': return 'bg-green-500';
      case 'SELL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (type) => {
    switch (type) {
      case 'BUY': return 'bg-green-500';
      case 'SELL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="text-yellow-400" />
        <h2 className="text-xl font-bold">Strategy Signals</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {strategies.map((strat) => (
          <div key={strat.key} className="bg-slate-800 rounded-lg p-4 border-2 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{strat.name}</div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${getColorClass(strat.data.type)}`}>
                {strat.data.type}
              </div>
            </div>
            <div className="text-xs text-slate-400 mb-2">{strat.data.reason}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getProgressColor(strat.data.type)}`}
                  style={{ width: `${strat.data.strength}%` }}
                />
              </div>
              <div className="text-sm font-mono">{strat.data.strength}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Consensus */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-yellow-500/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">CONSENSUS SIGNAL</div>
            <div className="text-3xl font-bold text-yellow-400">{signals.consensus}</div>
          </div>
          <div className="text-6xl">⚖️</div>
        </div>
      </div>
    </div>
  );
}