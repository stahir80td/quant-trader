import { useState, useEffect, useRef } from 'react';

export default function useWebSocket() {
  const [price, setPrice] = useState(67432.50);
  const [bufferIndex, setBufferIndex] = useState(0);
  const [signals, setSignals] = useState({
    meanReversion: { type: 'NEUTRAL', strength: 50, reason: 'Initializing...' },
    momentum: { type: 'NEUTRAL', strength: 50, reason: 'Initializing...' },
    breakout: { type: 'NEUTRAL', strength: 50, reason: 'Initializing...' },
    rsi: { type: 'NEUTRAL', strength: 50, reason: 'Initializing...' },
    consensus: 'NEUTRAL'
  });
  const [connected, setConnected] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mockIntervalRef = useRef(null);
  const connectionAttempts = useRef(0);
  const maxAttempts = 3;

  const startMockData = () => {
    console.log('🎭 Starting mock data mode...');
    setUsingMockData(true);
    setConnected(true);

    const priceInterval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 50;
        const newPrice = prev + change;
        return Math.max(60000, Math.min(75000, newPrice));
      });
      setBufferIndex(prev => (prev + 1) % 1000);
    }, 1000);

    const signalInterval = setInterval(() => {
      const signalTypes = ['BUY', 'SELL', 'NEUTRAL'];
      const strategies = ['meanReversion', 'momentum', 'breakout', 'rsi'];
      const randomStrat = strategies[Math.floor(Math.random() * 4)];
      const signal = signalTypes[Math.floor(Math.random() * 3)];
      const strength = Math.floor(Math.random() * 60) + 40;

      setSignals(prev => {
        const newSignals = { ...prev };
        newSignals[randomStrat] = {
          type: signal,
          strength: strength,
          reason: `${signal} signal (demo mode)`
        };

        const buyCount = Object.keys(newSignals).filter(
          k => k !== 'consensus' && newSignals[k].type === 'BUY'
        ).length;
        const sellCount = Object.keys(newSignals).filter(
          k => k !== 'consensus' && newSignals[k].type === 'SELL'
        ).length;

        if (buyCount >= 3) {
          newSignals.consensus = 'STRONG BUY';
        } else if (buyCount >= 2) {
          newSignals.consensus = 'BUY';
        } else if (sellCount >= 3) {
          newSignals.consensus = 'STRONG SELL';
        } else if (sellCount >= 2) {
          newSignals.consensus = 'SELL';
        } else {
          newSignals.consensus = 'NEUTRAL';
        }

        return newSignals;
      });
    }, 3000);

    mockIntervalRef.current = { priceInterval, signalInterval };
  };

  const stopMockData = () => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current.priceInterval);
      clearInterval(mockIntervalRef.current.signalInterval);
      mockIntervalRef.current = null;
    }
    setUsingMockData(false);
  };

  const connect = () => {
    let wsUrl;
    
    if (window.location.hostname === 'localhost') {
      wsUrl = 'ws://localhost:8080/ws';
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      if (backendUrl) {
        wsUrl = backendUrl.replace(/^https?:/, protocol) + '/ws';
      } else {
        const host = window.location.host;
        wsUrl = `${protocol}//${host}/ws`;
      }
    }

    console.log(`🔌 Attempting WebSocket connection (attempt ${connectionAttempts.current + 1}/${maxAttempts})`);

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected - using REAL data');
        setConnected(true);
        setUsingMockData(false);
        connectionAttempts.current = 0;
        stopMockData();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setPrice(data.price);
          setBufferIndex(data.bufferIndex);
          setSignals(data.signals);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.warn('⚠️ WebSocket error:', error);
        setConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket closed');
        setConnected(false);
        
        connectionAttempts.current++;

        if (connectionAttempts.current >= maxAttempts) {
          console.warn(`⚠️ Failed to connect after ${maxAttempts} attempts. Switching to MOCK DATA.`);
          startMockData();
        } else {
          console.log(`🔄 Retrying in 3 seconds...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      setConnected(false);
      
      connectionAttempts.current++;
      
      if (connectionAttempts.current >= maxAttempts) {
        console.warn('⚠️ WebSocket not available. Switching to MOCK DATA.');
        startMockData();
      }
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      stopMockData();
    };
  }, []);

  return { price, bufferIndex, signals, connected, usingMockData };
}