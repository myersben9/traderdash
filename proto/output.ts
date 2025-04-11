export interface PricingData {
  id?: string;
  price?: number;
  time?: number;
  currency?: string;
  exchange?: string;
  quoteType?: PricingDataQuoteType;
  marketHours?: PricingDataMarketHoursType;
  changePercent?: number;
  dayVolume?: number;
  dayHigh?: number;
  dayLow?: number;
  change?: number;
  shortName?: string;
  expireDate?: number;
  openPrice?: number;
  previousClose?: number;
  strikePrice?: number;
  underlyingSymbol?: string;
  openInterest?: number;
  optionsType?: PricingDataOptionType;
  miniOption?: number;
  lastSize?: number;
  bid?: number;
  bidSize?: number;
  ask?: number;
  askSize?: number;
  priceHint?: number;
  vol_24hr?: number;
  volAllCurrencies?: number;
  fromCurrency?: string;
  lastMarket?: string;
  circulatingSupply?: number;
  marketcap?: number;
}

export enum PricingDataQuoteType {
  NONE = 0,
  ALTSYMBOL = 5,
  HEARTBEAT = 7,
  EQUITY = 8,
  INDEX = 9,
  MUTUALFUND = 11,
  MONEYMARKET = 12,
  OPTION = 13,
  CURRENCY = 14,
  WARRANT = 15,
  BOND = 17,
  FUTURE = 18,
  ETF = 20,
  COMMODITY = 23,
  ECNQUOTE = 28,
  CRYPTOCURRENCY = 41,
  INDICATOR = 42,
  INDUSTRY = 1000,
}

export enum PricingDataOptionType {
  CALL = 0,
  PUT = 1,
}

export enum PricingDataMarketHoursType {
  PRE_MARKET = 0,
  REGULAR_MARKET = 1,
  POST_MARKET = 2,
  EXTENDED_HOURS_MARKET = 3,
}

