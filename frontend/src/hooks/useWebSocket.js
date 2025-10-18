import { useState, useEffect, useRef } from 'react';

export default function useWebSocket() {
  const [price, setPrice] = useState(0);
  const [bufferIndex, setBufferIndex] = useState(0);
  const [signals, setSignals] = useState({
    meanReversion: { type: 'NEUTRAL', strength: 0, reason: '' },
    momentum: { type: 'NEUTRAL', strength: 0, reason: '' },
    breakout: { type: 'NEUTRAL', strength: 0, reason: '' },
    rsi: { type: 'NEUTRAL', strength: 0, reason: '' },
    consensus: 'NEUTRAL'
  });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnected(true);
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
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed. Reconnecting...');
        setConnected(false);
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnected(false);
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
    };
  }, []);

  return { price, bufferIndex, signals, connected };
}