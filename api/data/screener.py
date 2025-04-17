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
from typing import List, Dict

class DailyScreener:
    def __init__(self) -> None:
        """
        Initialize the DailyScreener class.
        """
        self.tickers = self.get_daily_screen()

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

        valid_tickers = []
        for quote in response["quotes"]:
            symbol = quote["symbol"]
            ticker = yf.Ticker(symbol)

            ticker_info = ticker.info

            floatShares = ticker_info["floatShares"] 

            bid = quote["bid"]
            ask = quote["ask"]

            volume = quote["regularMarketVolume"]

            try:
                averageDailyVolume = quote["averageDailyVolume10Day"]
            except KeyError:
                continue

            relativeVolume = volume / averageDailyVolume if averageDailyVolume > 0 else 0

        
            isValid = DailyConditions(floatShares, relativeVolume, bid).valid
            if isValid:
                valid_tickers.append({
                    "symbol": symbol,
                    "floatShares": floatShares,
                    "relativeVolume": relativeVolume,
                    "bid": bid,
                    "ask": ask,
                })

        return valid_tickers



    



