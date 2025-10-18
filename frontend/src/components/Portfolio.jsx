import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function Portfolio() {
  const [pnl, setPnl] = useState(2340.50);

  useEffect(() => {
    const interval = setInterval(() => {
      setPnl(p => p + (Math.random() - 0.48) * 10);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-emerald-400" />
        <h2 className="text-xl font-bold">Paper Portfolio</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-slate-400">Total P&L</div>
          <div className={`text-4xl font-bold ${pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl > 0 ? '+' : ''}${pnl.toFixed(2)}
          </div>
          <div className="text-sm text-slate-400">
            {((pnl / 10000) * 100).toFixed(2)}% return
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="text-sm text-slate-400 mb-2">Active Positions</div>
          <div className="bg-slate-800 rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>BTC/USDT</span>
              <span className="text-green-400">+$1,234</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ETH/USDT</span>
              <span className="text-green-400">+$890</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>SOL/USDT</span>
              <span className="text-red-400">-$125</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="text-sm text-slate-400 mb-2">Win Rate</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '67%' }} />
            </div>
            <div className="text-sm font-bold">67%</div>
          </div>
        </div>
      </div>
    </div>
  );
}