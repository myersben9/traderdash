# Use screener to fetch
# 1. Current Price from 2 to 20 dollars
# 2. Float shares from 0 million to 10 million
# 3. Relative volume above 5
# 4. News that came out today
# 5. Price change that went above 30%
# 6. Only look at stocks on the NASDAQ, NYSE, AMEX

# Once all criteria are met, return the stocks in a list that meet this critiria
import yfinance as yf
from yfinance import EquityQuery
from .conditions import DailyConditions
from typing import List, Dict, Optional

class DailyScreener:
    def __init__(self) -> None:
        """
        Initialize the DailyScreener class.
        """
        self.tickers = self.get_daily_screen()

    def get_ticker_info(self, quote: Dict = None, symbol = None) -> Dict:

        if quote is None and symbol:
            ticker_info = yf.Ticker(symbol).info
        elif quote is not None:
            ticker_info = yf.Ticker(quote["symbol"]).info
        elif quote is None and symbol is None:
            raise ValueError("Either quote or symbol must be provided.")
        
        floatShares = ticker_info["floatShares"] 
        # print(ticker_info)
        bid = ticker_info["bid"]
        ask = ticker_info["ask"]

        volume = ticker_info["regularMarketVolume"]

        try:
            averageDailyVolume = ticker_info["averageDailyVolume10Day"]
        except KeyError:
            raise KeyError(f"Key 'averageDailyVolume10Day' not found in quote for {ticker_info['symbol']}")

        relativeVolume = volume / averageDailyVolume if averageDailyVolume > 0 else 0

        return {
            "symbol": quote["symbol"] if quote else symbol,
            "floatShares": floatShares,
            "relativeVolume": relativeVolume,
            "bid": bid,
            "ask": ask,
        }

    def parse_screen_response(self, response: Dict) -> List[Dict]:
        """
        Parse the response from the screener and return a list of valid tickers, while retrieving additional information.
        """
        valid_tickers = []
        for quote in response["quotes"]:
            try:
                ticker_info = self.get_ticker_info(quote)
            except KeyError as e:
                print(f"KeyError: {e} for quote: {quote}")
                continue
            isValid = DailyConditions(ticker_info["floatShares"], ticker_info["relativeVolume"], ticker_info["bid"]).valid
            if isValid:
                valid_tickers.append({
                    "symbol": quote["symbol"],
                    "floatShares": ticker_info["floatShares"],
                    "relativeVolume": ticker_info["relativeVolume"],
                    "bid": ticker_info["bid"],
                    "ask": ticker_info["ask"],
                })

        if valid_tickers == []:
            default_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
            for ticker in default_tickers:
                ticker_info = self.get_ticker_info(symbol=ticker)
                valid_tickers.append({
                    "symbol": ticker,
                    "floatShares": ticker_info["floatShares"],
                    "relativeVolume": ticker_info["relativeVolume"],
                    "bid": ticker_info["bid"],
                    "ask": ticker_info["ask"],
                })
        return valid_tickers

    def get_daily_screen(self) -> List[Dict]:
        """
        Get a list of stocks that meet the daily screener criteria.
        """
        price_q   = EquityQuery('btwn', ['intradayprice', 2,20])  
        change_q  = EquityQuery('gt',   ['percentchange', 30])       
        region_q  = EquityQuery('eq', ['region', 'us'])  
        exchange_q = EquityQuery('is-in', ['exchange', 'NMS', 'NYQ', 'NGM', 'ASE', 'PCX', 'YHD', 'NCM'])

        combined = EquityQuery('and', [price_q, change_q, exchange_q, region_q])

        response = yf.screen(
            combined,
            sortField='percentchange', 
            sortAsc=True,         
        )

        screened_tickers = self.parse_screen_response(response)

        return screened_tickers



    