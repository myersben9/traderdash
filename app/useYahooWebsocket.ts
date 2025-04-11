import { useEffect, useRef } from 'react';
import {} from '@/proto/PricingDataJS.js'; // 👈 use default import // This is the .js file (actual logic)

const useYahooWebSocket = (ticker: string) => {
  const socketRef = useRef<WebSocket | null>(null);

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
        const msg = pricingProto.PricingData.decode(raw);
        console.log('[Decoded]', msg);
      } catch (err) {
        console.error('Decoding error:', err);
      }
    });

    return () => {
      socket.close();
    };
  }, [ticker]);
};

export default useYahooWebSocket;
