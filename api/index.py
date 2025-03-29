from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import api.data.yfetch as yfetch
from typing import Dict, Any

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://nextjs-fastapi-starter-one-pi.vercel.app",
        "https://nextjs-fastapi-starter-f4lael316-art-ecommerce.vercel.app"
    ],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/py/get_data")
def get_data(ticker: str, range: str = "1d", interval: str = "5m"):
    """
    Fetches data for a given ticker using yfetch module.
    """ 
    yf = yfetch.Yfetch([ticker], range=range, interval=interval)
    yf.fetch_data()
    df = yf.df  
    # include the index in the dict
    df.reset_index(inplace=True)
    print(df.to_dict(orient='records'))
    return df.to_dict(orient='records')  # Convert DataFrame to dictionary for JSON serialization