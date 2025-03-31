from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import api.data.yfetch as yfetch
from typing import Dict, Any

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        '*'
        # "http://localhost:3000",
        # "http://127.0.0.1:3000",
        # "https://nextjs-fastapi-starter-one-pi.vercel.app",
        # "https://nextjs-fastapi-starter-f4lael316-art-ecommerce.vercel.app"
    ],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# / API endpoint to fetch data
@app.get("/api/py/get_chart_data")
def get_chart_data(ticker: str, range: str = "1d", interval: str = "5m"):
    """
    Fetches data for a given ticker using yfetch module.
    """ 
    yf = yfetch.Yfetch([ticker], range=range, interval=interval)
    yf.fetch_data()
    df = yf.df  
    df.reset_index(inplace=True)
    return df.to_dict(orient='records')  # Convert DataFrame to dictionary for JSON serialization