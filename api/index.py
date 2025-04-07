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

async def on_connect_to_yahoo(ticker: str, action_type: str = "subscribe"):
    try:
        yahoo_ws = await websockets.connect(
            uri=YAHOO_WS_URI,
        )
        subscription_message = json.dumps({"subscribe": ["BTC-USD"]})
        await yahoo_ws.send(subscription_message)
        print(f"Subscribed to {ticker}")
        return yahoo_ws
    except Exception as e:
        print(f"[Connection Error] Failed to connect or subscribe: {e}")
        raise e

async def on_message_yahoo(yahoo_ws, client_ws: WebSocket):
    while True:
        try:
            raw = await asyncio.wait_for(yahoo_ws.recv(), timeout=5)
            decoded = base64.b64decode(raw)
            pricing_data = PricingData_pb2.PricingData()
            pricing_data.ParseFromString(decoded)
            json_data = MessageToJson(pricing_data)
            print(f"[Update] {json_data}")
            await client_ws.send_text(json_data)
        except asyncio.TimeoutError:
            await client_ws.send_text(json.dumps({"status": "idle", "message": "No updates yet"}))
        except Exception as e:
            print(f"[Error] {e}")
            break


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        message = await websocket.receive_text()
        payload = json.loads(message)
        ticker = payload.get("ticker")
        action_type = payload.get("type", "subscribe")

        yahoo_ws = await on_connect_to_yahoo(ticker, action_type)
        await on_message_yahoo(yahoo_ws, websocket)

    # ex
    #     print("Client disconnected")
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