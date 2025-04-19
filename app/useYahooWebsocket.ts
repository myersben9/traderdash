import { useEffect, useRef, useState } from 'react'; // Import useState
import { WebSocketState } from './models';
import { PricingData } from '@/proto/pricingData'
import { get } from 'http';

let exampleWebSocketState = {'id': 'AAPL', 'price': 172.6, 'time': '1744145133000', 'exchange': 'NMS', 'quoteType': 'EQUITY', 'marketHours': 'POST_MARKET', 'changePercent': 0.10440084, 'change': 0.18000793, 'priceHint': '2'}

// Use the example websocket state as an example on how to structure the state if the webscoket isn't returning anything back because its outside of market hours
// const getCurrentWebSocketState = async (exampleWebSocketState): Promise<any> => {
//     try {
//         const url = `/api/py/get_websocket_state?ticker=${ticker}`;
//         const response = await fetch(url);
//         const data = await response.json();
//         console.log("WebSocket state:", data);
//         return data;
//     } catch (error) {
//         console.error("Error fetching WebSocket state:", error);
//         return exampleWebSocketState; // Return example state on error
//     }
// }

      
export const useYahooWebSocket = (exampleWebSocketState: Record<string, any>): PricingData => {

  const socketRef = useRef<WebSocket | null>(null);
  const [yahooWebSocketState, setYahooWebSocketState] = useState<PricingData>(
    exampleWebSocketState as unknown as PricingData // Initialize with example data
  ); // New state

  useEffect(() => {
    const socket = new WebSocket('wss://streamer.finance.yahoo.com');
    socketRef.current = socket;

    const subscription = {
      subscribe: [exampleWebSocketState['id']],
    };
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify(subscription));
    });

    socket.addEventListener('message', (event) => {
      try {
        const base64 = event.data;
        const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const message = PricingData.decode(raw);
        // If message is empty, return the example state
        if (Object.keys(message).length === 0) {
          console.log("Empty message received, returning example state");
          setYahooWebSocketState(exampleWebSocketState as unknown as PricingData);
          return;
        }
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
  }, [exampleWebSocketState['id']]); // Dependency array with ticker

  return yahooWebSocketState; // Return the new state
};

export default useYahooWebSocket;