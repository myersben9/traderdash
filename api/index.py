from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import api.data.yfetch as yfetch
import yfinance as yf
from api.data.screener import DailyScreener

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
    try:

        screener = DailyScreener().tickers
        if screener:
            return screener
        else:
            return {"error": "No valid tickers found."}
    except Exception as e:
        return {"error": str(e)}