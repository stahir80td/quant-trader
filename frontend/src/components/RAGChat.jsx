import React, { useState } from 'react';
import { Brain, Search } from 'lucide-react';

export default function RAGChat() {
  const [chatQuery, setChatQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [response, setResponse] = useState('');

  const exampleQueries = [
    "Why is momentum signaling BUY?",
    "How does mean reversion work?",
    "Explain the ring buffer"
  ];

  const handleQuery = async () => {
    if (!chatQuery.trim()) return;

    setShowChat(true);
    
    // Simple mock response (replace with actual API call to /api/rag/query)
    const mockResponse = "Momentum is signaling BUY because 7+ out of the last 10 ticks show upward movement, indicating a strong uptrend. This pattern has a historical success rate of ~60% on high-volume assets like BTC.";
    
    setTimeout(() => {
      setResponse(mockResponse);
    }, 500);
  };

  return (
    <div className="bg-slate-900 border-2 border-pink-500 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-pink-400" />
        <h2 className="text-xl font-bold">AI Assistant</h2>
      </div>

      <div className="space-y-3 mb-4">
        <div className="text-sm text-slate-400">Ask about strategies:</div>
        {exampleQueries.map((query, i) => (
          <button
            key={i}
            onClick={() => {
              setChatQuery(query);
              handleQuery();
            }}
            className="w-full text-left text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded p-3 transition-all"
          >
            "{query}"
          </button>
        ))}
      </div>

      {showChat && (
        <div className="bg-slate-800 border border-pink-500/50 rounded-lg p-4 space-y-3 mb-4">
          <div className="text-sm bg-slate-700 rounded p-3">
            <div className="text-pink-400 font-bold mb-1">You:</div>
            {chatQuery}
          </div>
          <div className="text-sm bg-slate-700/50 rounded p-3">
            <div className="text-cyan-400 font-bold mb-1">AI:</div>
            {response}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask anything..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-4 py-2 text-sm focus:outline-none focus:border-pink-500"
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
        />
        <button 
          onClick={handleQuery}
          className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded transition-all"
        >
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}