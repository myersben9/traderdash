import { useEffect, useRef, useState } from 'react'; // Import useState
import { WebSocketState } from './models';
import { PricingData } from '@/proto/pricingData'

const exampleWebSocketState = {'id': 'AAPL', 'price': 172.6, 'time': '1744145133000', 'exchange': 'NMS', 'quoteType': 'EQUITY', 'marketHours': 'POST_MARKET', 'changePercent': 0.10440084, 'change': 0.18000793, 'priceHint': '2'}

export const useYahooWebSocket = (ticker: string) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [yahooWebSocketState, setYahooWebSocketState] = useState<PricingData>(
    exampleWebSocketState as unknown as PricingData // Initialize with example data
  ); // New state

  useEffect(() => {
    const socket = new WebSocket('wss://streamer.finance.yahoo.com');
    socketRef.current = socket;

    const subscription = {
      subscribe: [ticker]
    };
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify(subscription));
    });

    socket.addEventListener('message', (event) => {
      try {
        const base64 = event.data;
        const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const message = PricingData.decode(raw);
        setYahooWebSocketState(message); // Update the state with the decoded message
      } catch (err) {
        console.error('Decoding error:', err);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [ticker]);

  return yahooWebSocketState; // Return the new state
};

export default useYahooWebSocket;