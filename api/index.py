from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import api.data.yfetch as yfetch
import yfinance as yf

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        '*'
        # "http://localhost:3000",
        # "http://127.0.0.1:3000"
    ],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# / API endpoint to fetch data
@app.get("/api/py/get_chart_data")
def get_chart_data(ticker: str, range: str = "1d", interval: str = "5m", pre_post:str='false'):
    """
    Fetches data for a given ticker using yfetch module.
    """ 
    try:
        if pre_post == 'true':
            pre_post = True
        else:
            pre_post = False
        print(f"Fetching data for {ticker} with range {range} and interval {interval}")
        yf = yfetch.Yfetch([ticker], range=range, interval=interval, pre_post=pre_post)
        yf.fetch_data()
        df = yf.df  
        df.reset_index(inplace=True)
        return df.to_dict(orient='records')  # Convert DataFrame to dictionary for JSON serialization
    except Exception as e:
        return {"error": str(e)}
    

# Write an endpoint that fetches the most recent news about a ticker given a ticker
@app.get("/api/py/get_spy_news")
def get_spy_news():
    """
    Fetches the most recent news for a given ticker.
    """
    try:
        print("Fetching news for SPY")
        yahooTicker = yf.Ticker("SPY")
        news = yahooTicker.news
        recent_news = news[:5] 
        return recent_news
    except Exception as e:
        return {"error": str(e)}
    

@app.get("/api/py/get_ticker_news") 
def get_ticker_news(ticker: str):
    """
    Fetches the most recent news for a given ticker.
    """
    try:
        print("Fetching news for {ticker}")
        yahooTicker = yf.Ticker(ticker)
        news = yahooTicker.news
        recent_news = news[:5]
        return recent_news
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/api/py/get_daily_screen")
def get_daily_screen():
    """
    Fetches the daily screen data.
    """
    "Make custome screeners, dont relly on yfinance it sucks"
    # try:
    #     screener = DailyScreener().tickers
    #     return screener
    # except Exception as e:
    #     print(f"Error fetching daily screen data: {e}")
    #     return {"error": str(e)}

@app.get("/api/py/get_websocket_state")
def get_websocket_state(ticker: str):
    """
    Fetches the a websocket state imitation when the websocket isn't returning data becaus eits outside of market hours.
    """
    ticker_info = yf.Ticker(ticker).info
    # {'id': 'AAPL', 'price': 172.6, 'time': '1744145133000', 'exchange': 'NMS', 'quoteType': 'EQUITY', 'marketHours': 'POST_MARKET', 'changePercent': 0.10440084, 'change': 0.18000793, 'priceHint': '2'}
    return_message = {
        'id': ticker_info['symbol'],
        'price': ticker_info['currentPrice'],
        'time': ticker_info['postMarketTime'],
        'exchange': ticker_info['exchange'],    
        'quoteType': ticker_info['quoteType'],
        'marketHours': 'POST_MARKET',
        'changePercent': ticker_info['regularMarketChangePercent'],
        'change': ticker_info['regularMarketChange'],
        'priceHint': ticker_info['priceHint']
    }
    print(f"Websocket state for {ticker}: {return_message}")
    return return_message