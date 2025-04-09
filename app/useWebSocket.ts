import { useEffect, useState } from 'react';
import { getHost } from "@/app/constants";
import { WebSocketState } from '@/app/models';

// Example const interface for the websocket state
const exampleWebSocketState = {'id': 'AAPL', 'price': 172.6, 'time': '1744145133000', 'exchange': 'NMS', 'quoteType': 'EQUITY', 'marketHours': 'POST_MARKET', 'changePercent': 0.10440084, 'change': 0.18000793, 'priceHint': '2'}
const exampleWebSocketState2 = {'id': 'BTC-USD', 'price': 77101.91, 'time': '1744145040000', 'currency': 'USD', 'exchange': 'CCC', 'quoteType': 'CRYPTOCURRENCY', 'marketHours': 'REGULAR_MARKET', 'changePercent': -2.4294398, 'dayVolume': '49118683136', 'dayHigh': 80718.65, 'dayLow': 76416.53, 'change': -1919.7812, 'openPrice': 79140.75, 'lastSize': '49118683136', 'priceHint': '2', 'vol24hr': '49118683136', 'volAllCurrencies': '49118683136', 'fromCurrency': 'BTC', 'circulatingSupply': 19848556.0, 'marketcap': 1530361540000.0}
const exampleWebSocketState3= {'id': '^VIX', 'price': 52.33, 'time': '1744143301000', 'exchange': 'CXI', 'quoteType': 'INDEX', 'marketHours': 'REGULAR_MARKET', 'changePercent': 11.38783, 'change': 5.3500023, 'priceHint': '2'}


export const useWebSocket = (ticker: string) => {
  const [websocketState, setWebsocketData] = useState<WebSocketState>(exampleWebSocketState);

  useEffect(() => {
    // Get enviornment variable for host
    const host = getHost();
    const ws = new WebSocket(`ws://${host}/ws`);
    ws.onopen = () => {
      ws.send(JSON.stringify({ subscribe: [ticker] }));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data) {
        setWebsocketData(data);
      }
    }
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    return () => ws.close();
  }, [ticker]);

  return websocketState;
};