

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

export interface CanonicalUrl {
  url : string;
  site : string;
  region : string;
  lang : string;
}


export interface NewsStateData {
  id: string;
  content: NewsStateContent;
  provider: Record<string, string>;
  clickThroughUrl: Record<string, string>;
  metadata: Record<string, string>;
  finance: Record<string, string>;
  storyline: any | null;
}

export interface NewsStateContent {
  canonicalUrl: CanonicalUrl;
  title: string;
  contentType: string;
  summary: string;
  date: string;
  link: string;
  source: string;
  pubDate: string;
  displayTime: string;
  thumbnail: Thumbnail;
}

export interface Thumbnail {
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  caption: string;
  resolutions: ThumbnailResolution[];

}

export interface ThumbnailResolution {
  url: string;
  width: number;
  height: number;
  tag: string;
}