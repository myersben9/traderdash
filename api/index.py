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
import api.data.liveTicker as liveTicker

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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    uri = "wss://streamer.finance.yahoo.com:443"
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    data = await websocket.receive_text()
    data = json.loads(data)
    print(f"Received JSON data: {data}")
    try:
        liveTicker.YLiveTicker(
            on_ticker=websocket.send_text,
            ticker_names=["AMZN"],
            on_error=websocket.send_text,
            on_close=websocket.close
        )
        # async with websockets.connect(uri, user_agent_header=user_agent, origin='') as yahoo_ws:
        #     subscription_message = json.dumps({ data['type']: ['BTC'] })
        #     print(f"Subscribing to: {subscription_message}")
        #     await yahoo_ws.send(subscription_message)
        #     print("Connected to Yahoo WebSocket")

        #     while True:
        #         try:
        #             print("Waiting for data...")
        #             data = await asyncio.wait_for(yahoo_ws.recv(), timeout=1)   
        #             #Base 64 decode the data
        #             data = base64.b64decode(data)                 
        #             data_bytes = bytes(data)
        #             stock_data = PricingData_pb2.PricingData()
        #             stock_data.ParseFromString(data_bytes)
        #             await websocket.send_text(stock_data.SerializeToString().hex())
        #         except asyncio.TimeoutError:
        #             # No update received in 5 seconds
        #             await websocket.send_text(json.dumps({"status": "idle", "message": "No updates yet"}))
        #         except DecodeError as e:
        #             print(f"Decode error: {e}")
        #         except Exception as e:
        #             print(f"WebSocket read error: {e}")
        #             break
    except Exception as e:
        print(f"Connection error: {e}")
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