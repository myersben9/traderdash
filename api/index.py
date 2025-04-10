from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import api.data.yfetch as yfetch
import websockets
import PricingData_pb2  # Import your protobuf class
from google.protobuf.message import DecodeError
from fastapi import WebSocket
import json
import asyncio
import base64
from websockets.sync.client import connect
from google.protobuf.json_format import MessageToJson
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
YAHOO_WS_URI = "wss://streamer.finance.yahoo.com"
# --- Handler Functions ---

tickers = set()

async def on_connect_to_yahoo(subscription_message):
    try:
        yahoo_ws = await websockets.connect(
            uri=YAHOO_WS_URI,
        )
        await yahoo_ws.send(subscription_message)
        return yahoo_ws
    except Exception as e:
        print(f"[Connection Error] Failed to connect or subscribe: {e}")
        raise e

async def on_message_yahoo(yahoo_ws, client_ws: WebSocket):
    while True:
        try:
            # 
            raw = await yahoo_ws.recv()
            decoded = base64.b64decode(raw)
            pricing_data = PricingData_pb2.PricingData()
            pricing_data.ParseFromString(decoded)
            json_data = MessageToJson(pricing_data)
            data = json.loads(json_data)
            if data['id'] not in tickers:
                tickers.add(data['id']) 

            if len(tickers) > 1:
                # Send unsubscribe ticker the the one that we didn't just add
                unsubscribe_message = {
                    "unsubscribe": [list(tickers)[0]]
                }
                msg = json.dumps(unsubscribe_message)
                await yahoo_ws.send(msg)
            await client_ws.send_text(json_data)
        except Exception as e:
            print(f"[Error] {e}")
            break


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        message = await websocket.receive_text()
        yahoo_ws = await on_connect_to_yahoo(message)
        await on_message_yahoo(yahoo_ws, websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_text(json.dumps({"status": "error", "message": str(e)}))

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