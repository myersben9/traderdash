

export interface WebSocketState {
  id: string;
  price: number;
  time: string;
  exchange: string;
  quoteType: string;
  marketHours: string;
  changePercent: number;
  change: number;
  priceHint: string;
  currency?: string;
  dayVolume?: string;
  dayHigh?: number;
  dayLow?: number;
  openPrice?: number;
  lastSize?: string;
  vol24hr?: string;
  volAllCurrencies?: string;
  fromCurrency?: string;
  circulatingSupply?: number;
  marketcap?: number;
}
export interface ChartPoint {
  Timestamp: string; // or use Date if the timestamp is a Date object
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Symbol: string;
}