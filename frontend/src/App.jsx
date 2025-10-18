import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Brain, Search, Zap } from 'lucide-react';
import useWebSocket from './hooks/useWebSocket';
import PriceCard from './components/PriceCard';
import RingBuffer from './components/RingBuffer';
import StrategyGrid from './components/StrategyGrid';
import Portfolio from './components/Portfolio';
import RAGChat from './components/RAGChat';
import PerformanceMetrics from './components/PerformanceMetrics';
import Architecture from './components/Architecture';

export default function App() {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { price, signals, bufferIndex, connected } = useWebSocket();

  const pairs = [
    { name: 'BTC/USDT', price: price || 67432.50, change: 2.3, volume: '24.5B' },
    { name: 'ETH/USDT', price: 3245.80, change: -1.2, volume: '12.3B' },
    { name: 'SOL/USDT', price: 142.35, change: 5.7, volume: '2.1B' },
    { name: 'BNB/USDT', price: 582.90, change: 1.8, volume: '1.8B' }
  ];

  // Calculate consensus for hero display
  const getConsensusDisplay = () => {
    if (!signals || !signals.consensus) {
      return { text: 'NEUTRAL', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: '⚖️' };
    }

    const consensus = signals.consensus;
    if (consensus === 'STRONG BUY' || consensus === 'BUY') {
      return { 
        text: consensus, 
        color: 'text-green-400', 
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500',
        icon: '🟢'
      };
    } else if (consensus === 'STRONG SELL' || consensus === 'SELL') {
      return { 
        text: consensus, 
        color: 'text-red-400', 
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500',
        icon: '🔴'
      };
    }
    return { 
      text: 'NEUTRAL', 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      icon: '🟡'
    };
  };

  const consensusDisplay = getConsensusDisplay();

  // Calculate agreement count
  const getAgreementCount = () => {
    if (!signals) return '0/4';
    
    const consensus = signals.consensus;
    let count = 0;
    
    if (consensus.includes('BUY')) {
      if (signals.meanReversion?.type === 'BUY') count++;
      if (signals.momentum?.type === 'BUY') count++;
      if (signals.breakout?.type === 'BUY') count++;
      if (signals.rsi?.type === 'BUY') count++;
    } else if (consensus.includes('SELL')) {
      if (signals.meanReversion?.type === 'SELL') count++;
      if (signals.momentum?.type === 'SELL') count++;
      if (signals.breakout?.type === 'SELL') count++;
      if (signals.rsi?.type === 'SELL') count++;
    }
    
    return `${count}/4`;
  };

  // Calculate average confidence
  const getAverageConfidence = () => {
    if (!signals) return 0;
    
    const strengths = [
      signals.meanReversion?.strength || 0,
      signals.momentum?.strength || 0,
      signals.breakout?.strength || 0,
      signals.rsi?.strength || 0
    ];
    
    return Math.round(strengths.reduce((a, b) => a + b, 0) / 4);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white">
      {/* Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400">
              Quant Trader
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Real-time multi-strategy consensus engine with lock-free circular buffer architecture
            </p>
          </div>
          
          {/* Page Tabs */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('architecture')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'architecture'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Architecture
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      {currentPage === 'dashboard' ? (
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Connection Status */}
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-slate-400">
                  {connected ? 'Connected • Real-time data streaming' : 'Connecting...'}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1">
                  <Zap size={12} className="text-yellow-400" />
                  4 parallel strategies
                </span>
                <span className="flex items-center gap-1">
                  <Activity size={12} className="text-green-400" />
                  Sub-10ms latency
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} className="text-blue-400" />
                  1000 slots ring buffer
                </span>
              </div>
            </div>

            {/* HERO SECTION - Consensus Signal */}
            <div className={`mb-6 ${consensusDisplay.bgColor} border-2 ${consensusDisplay.borderColor} rounded-lg p-6 md:p-8`}>
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">
                  Consensus Signal
                </div>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-6xl">{consensusDisplay.icon}</div>
                  <div className={`text-5xl md:text-6xl font-bold ${consensusDisplay.color}`}>
                    {consensusDisplay.text}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Confidence</div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {getAverageConfidence()}%
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Agreement</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {getAgreementCount()} strategies
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">Status</div>
                    <div className="text-2xl font-bold text-green-400">
                      ✅ LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Bar - Pair Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {pairs.map(pair => (
                <button
                  key={pair.name}
                  onClick={() => setSelectedPair(pair.name)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPair === pair.name 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm md:text-base">{pair.name}</div>
                  <div className="text-xl md:text-2xl font-mono">${pair.price.toLocaleString()}</div>
                  <div className={`text-xs md:text-sm ${pair.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pair.change > 0 ? '↗' : '↘'} {Math.abs(pair.change)}%
                  </div>
                  <div className="text-xs text-slate-500">Vol: {pair.volume}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Price, Strategies & Performance */}
              <div className="lg:col-span-2 space-y-6">
                <PriceCard price={price} />
                <StrategyGrid signals={signals} />
                <PerformanceMetrics bufferIndex={bufferIndex} signals={signals} />
              </div>

              {/* Right Column - Ring Buffer, Portfolio & RAG */}
              <div className="space-y-6">
                <RingBuffer bufferIndex={bufferIndex} />
                <Portfolio />
                <RAGChat />
              </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-4 text-center text-xs md:text-sm text-slate-400">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Ring buffer: 1000 slots
                </div>
                <span className="hidden md:inline">•</span>
                <div>4 strategies in parallel</div>
                <span className="hidden md:inline">•</span>
                <div>Go backend + React frontend</div>
                <span className="hidden md:inline">•</span>
                <div className="text-cyan-400">Lock-free architecture</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Architecture />
      )}
    </div>
  );
}