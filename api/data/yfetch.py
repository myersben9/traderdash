# yfetch.py
import asyncio
import aiohttp
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging
from .constants import Constants
from .chartparse import ChartParse
from .proxy import ProxyRotator

logger = logging.getLogger(__name__)

class Yfetch:
    def __init__(self, 
                 tickers: List[str],
                 interval: str = "5m",
                 pre_post: bool = False,
                 timezone: str = 'America/Los_Angeles',
                 range: str = "max",
                 start_date: Optional[str] = None,
                 end_date: Optional[str] = None) -> None:
        
        self.tickers = tickers
        self.interval = interval
        self.pre_post = pre_post
        self.timezone = timezone
        self.range = range
        self.start_date = start_date
        self.end_date = end_date
        self._event_loop = None
        self.df = pd.DataFrame()

    def fetch_data(self) -> None:
        """Synchronous entry point that manages async event loop"""
        try:
            if self._is_event_loop_running():
                # If in async context, create new loop
                self._event_loop = asyncio.new_event_loop()
                self._event_loop.run_until_complete(self._async_fetch_data())
            else:
                # Use default event loop
                asyncio.run(self._async_fetch_data())
        except Exception as e:
            logger.error(f"Error in synchronous fetch: {e}")
        finally:
            if self._event_loop:
                self._event_loop.close()

    async def _async_fetch_data(self) -> None:
        """Async data fetching implementation"""
        try:
            async with aiohttp.ClientSession() as session:
                tasks = [self._fetch_ticker(session, ticker) 
                        for ticker in self.tickers]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                self._process_results(results)
        except Exception as e:
            logger.error(f"Error in async fetch: {e}")


    async def _fetch_ticker(self, session: aiohttp.ClientSession, ticker: str) -> Optional[pd.DataFrame]:
        """Fetch data for a single ticker"""
        try:
        
            url = f"{Constants._BASE_URL}{Constants._endpoints['chart'].format(ticker=ticker)}"
            params = self._build_params()
            async with session.get(url, params=params, headers=Constants._HEADERS, ssl=False ) as response:
                if response.status != 200:
                    logger.warning(f"Failed to fetch {ticker}: HTTP {response.status} {response.reason}")
                    return None
                
                data = await response.json()
                return ChartParse(data, self.timezone, pre_post=self.pre_post).df
                
        except Exception as e:
            logger.error(f"Error fetching {ticker}: {e}")
            return None

    def _build_params(self) -> Dict[str, Any]:
        """Build request parameters"""
        params = {
            'interval': self.interval,
            'includePrePost': str(self.pre_post).lower(),
        }

        if self.start_date and self.end_date:
            start, end = self._parse_dates()
            params.update({'period1': start, 'period2': end})
        else:
            params['range'] = self.range

        return params

    def _parse_dates(self) -> Tuple[int, int]:
        """Convert dates to UTC timestamps"""
        try:
            start = pd.Timestamp(self.start_date, tz=self.timezone).timestamp()
            end = pd.Timestamp(self.end_date, tz=self.timezone).timestamp()
            return int(start), int(end)
        except Exception as e:
            logger.error(f"Invalid dates: {e}")
            raise ValueError("Invalid date format") from e

    def _process_results(self, results: List[Any]) -> None:
        """Combine and process all results"""
        valid_dfs = [r for r in results if isinstance(r, pd.DataFrame) and not r.empty]
        
        if not valid_dfs:
            logger.warning("No valid data received")
            self.df = pd.DataFrame()
            return

        # Stack all dataframes
        self.df = pd.concat(valid_dfs)

    def _clean_data(self) -> None:
        """Post-processing cleanup"""
        
        # Convert volume to integers
        if 'Volume' in self.df.columns:
            self.df['Volume'] = self.df['Volume'].fillna(0).astype(int)

    @staticmethod
    def _is_event_loop_running() -> bool:
        """Check if there's a running event loop"""
        try:
            asyncio.get_running_loop()
            return True
        except RuntimeError:
            return False

async def init_yfetch():
    yfetch = Yfetch(
        tickers=['AAPL', 'MSFT', 'GOOGL'],
        interval='1m',
        range='1d',
        pre_post=True
    )
    yfetch.fetch_data()
    print(yfetch.df)

if __name__ == "__main__":
    asyncio.run(init_yfetch())
    
