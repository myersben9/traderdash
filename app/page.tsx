"use client";

// {FINISH BY TODAY GOAL}
// TODO - Create live newsfeed component that updates every 5 seconds
// TODO - Make images work, make links for news clickable, 
// TODO - Add adequate loading and error handling for different inputs for ticker
// TODO - Add loading and error handling for websocket connection/ fetches with toasts
// TODO - Make buffer adjustable on the data in the range, so data goes outside of the chart when buffer is increased
// TODO - Make live price still accurate even when the websocket isn't running


// {COMING UP}
// TODO - Make chart component resizable to fullscreen, mobile, and different sizes, everything repsonsive (difficulty: scuffed)
// TODO - Add candelstick chart toggle button (difficulty: easy somewhat)
// TODO - ADD VWAP, EMA, SMA, and other indicators (difficulty: easy)
// TODO - Add volume chart below the main chart with green and red by selling (difficulty: easy)
// TODO - Add ability to click on sticks from screener, news, or other places and open it in teh chart component
// TODO - Add a scanner for stocks that are moving up 30%, are on the nasdaq, have a float of less than 5 million, have a 5x relative volume, priced 3-20 dollars
// TODO - Add feature to log in and track bots and trade with hotkeys on user accounts
// TODO - Add ability to draw lines on chart with mouse and visualize strategies / stop losses / profit taking
// TODO - Add active trade tracking and metrics for trades 
// TODO - Make shad cn components for tables of screeners, news, and other things

import React from 'react'
import { Search } from 'lucide-react';

import ChartComponent from '@/app//chartComponent';
import { abbreviateNumber} from '@/app/utils';
import useSWR from 'swr';
import { fetcher } from '@/app/utils';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { PricingData } from '@/proto/pricingData'
import NewsComponent from '@/app/newsComponent';
import { set } from 'react-hook-form';
// import ScreenComponent from './screenComponent';


export default function Home() {

  const [range, setRange] = React.useState('1d');
  const [interval, setInterval] = React.useState<string | null>('1m');
  const [ticker, setTicker] = React.useState('AAPL');
  const [prePost, setPrePost] = React.useState(false);
  const socketRef = React.useRef<WebSocket | null>(null);
  const [yahooWebSocketState, setYahooWebSocketState] = React.useState<PricingData>({
    id: 'AAPL',
    price: 172.6,
    time: '1744145133000',
    exchange: 'NMS',
    quoteType: 'EQUITY',
    marketHours: 'POST_MARKET',
    changePercent: 0.10440084,
    change: 0.18000793,
    priceHint: '2'
  } as unknown as PricingData); // Initialize with example data


  React.useEffect(() => {
    const socket = new WebSocket('wss://streamer.finance.yahoo.com');
    socketRef.current = socket;

    const subscription = {
      subscribe: [ticker],
    };
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify(subscription));
    });

    // On error, log the error
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });
  
    socket.addEventListener('message', (event) => {
      try {
        const base64 = event.data;
        const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const message = PricingData.decode(raw);
        // If message is empty, return the example state
        if (Object.keys(message).length === 0) {
          console.log("Empty message received, returning example state");
          return;
        }
        setYahooWebSocketState(message); // Update the state with the decoded message
      } catch (err) {
        console.error('Decoding error:', err);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [ticker]); 


  return (
    <main className="flex flex-col">
    <div className="flex flex-row w-full h-[100vh]">
      <div className='flex flex-col items-start justify-star w-[50vw]'>
        <div className='flex flex-row items-end justify-start p-3'>
            <div className='flex flex-row items-center justify-end mr-3'>
            <Input
              type="text"
              id="ticker"
              placeholder='GOOGL'
              className="w-[100px] h-[50px] mb-4"
              name="ticker"
              defaultValue={ticker}
              onBlur={(e) => {
                if (e.target.value === ticker) return;
                setTicker(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setTicker(e.currentTarget.value);
                }
              }}
            />
            
            <Search
              className={`absolute mb-4 mr-2 ml-2 cursor-pointer`}
              onClick={() => {
                if (document.getElementById('ticker') === null) return;
                const input = document.getElementById('ticker') as HTMLInputElement;
                setTicker(input.value);

              }}
            />  
            </div>
          <div id="rangeButtons" className='flex flex-row items-center justify-end mr-3'>
            <Button
              id='rangeButton-1d'
              variant="outline"
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${range === '1d' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setRange('1d');
                setInterval('1m');
              }}
              >
                1d
            </Button>
            <Button
              id='rangeButton-14d'
              variant="outline"
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${range === '14d' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setRange('14d');
                setInterval('1h');
              }}
              >
                14d
            </Button>
            <Button
              id='rangeButton-1mo'
              variant="outline"
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${range === '1mo' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setRange('1mo');
                setInterval('30m');
              }}
              >
                1mo
            </Button>
            <Button
              id='rangeButton-3mo'
              variant="outline"
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${range === '3mo' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setRange('3mo');
                setInterval('1d');
              }}
              >
                3mo
            </Button>
            <Button
              id='rangeButton-max'
              variant="outline"
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${range === 'max' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setRange('max');
                setInterval(null);
              }
              }
              >
                max
            </Button>
          </div>
          <div className='flex flex-row items-center justify-end mr-3'>
            <Button
              id='intervalButton-1m'
              variant="outline"
              disabled={range === 'max' || range ==='3mo' || range ==='1mo' || range ==='14d'}
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${interval === '1m' ? 'enabled:bg-blue-500' : ''}`}
              onClick={() => {
                setInterval('1m');
              }
              }
              >
                1m
            </Button>
            <Button
              id='intervalButton-5m'
              variant="outline"
              disabled={range === 'max'|| range ==='3mo' || range ==='1mo' || range ==='14d'}
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${interval === '5m' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setInterval('5m');
              }
              }
              >
                5m
            </Button>
            <Button
              id='intervalButton-15m'
              variant="outline"
              disabled={range === 'max'|| range ==='3mo' || range ==='1mo'}
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${interval === '15m' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setInterval('15m');
              }
              }
              >
                15m
            </Button>
            <Button
              id='intervalButton-30m'
              variant="outline"
              disabled={range === 'max'|| range ==='3mo'}
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${interval === '30m' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setInterval('30m');
              }
              }
              >
                30m
            </Button>
            <Button
              id='intervalButton-1h'
              variant="outline"
              disabled={range === 'max' || range ==='3mo'}
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${interval === '1h' ? 'bg-blue-500' : ''}`}
              onClick={() => {
                setInterval('1h');
              }
              }
              >
                1h
            </Button>
            <Button
              id='intervalButton-1d'
              variant="outline"
              disabled={range === 'max'}
              className={`w-[20px] h-[50px] mb-4 mr-[3px] ${interval === '1d' ? 'bg-blue-500' : ''}`}
              onClick={() => {    
                setInterval('1d');
              }
              }
              >
                1d
            </Button>
            </div>
            <div className="flex flex-row items-center justify-end mr-3">
              <Button
                id='prePostButton'
                variant="outline"
                className={`w-[70px] h-[50px] mb-4 mr-[3px] ${prePost ? 'bg-blue-500' : ''}`}
                onClick={() => {
                  setPrePost(!prePost);
                }
                }
                >
                Pre/Post
              </Button>
             
            </div>
        </div>

       
        <div className='flex flex-row items-center justify-start mb-4 ml-3'>
          <h1 className='text-2xl font-bold text-white'>
            {ticker.toUpperCase()}
          </h1>
          <h2 className='text-sm font-bold text-gray-500 ml-3'>
            {range} {interval ? `(${interval})` : ''}
          </h2>
          <h2 className='text-sm font-bold text-gray-500 ml-3'>
            {prePost ? 'Pre/Post' : ''}
          </h2>
          <div className={`flex flex-row items-left col-span-2 justify-start h-5`}>
              <span id="newDate" className='text-sm font-bold text-white ml-3'></span>
              <span id="newTime" className='text-sm font-bold text-white ml-3'></span>
          </div>
        </div>
        <div className={`flex flex-row ml-3 h-10`}>
          <h2 id='livePrice' className={`
            text-2xl font-bold text-white
            ${yahooWebSocketState.change > 0 ? 'text-green-500' : 'text-red-500'}
          `}>
            { 
              yahooWebSocketState.price.toFixed(2)
            }
          </h2>
        </div>
        <div className="flex items-center text-left space-x-1 ml-3">
        <span className={`
            text-xs 
            ${yahooWebSocketState.change > 0 ? 'text-green-500' : 'text-red-500'}
          `}>
            {yahooWebSocketState.change > 0 ? '▲' : '▼'}
          </span>
        <span className={`
            text-xs font-bold 
            ${yahooWebSocketState.change > 0 ? 'text-green-500' : 'text-red-500'}
          `}>
          {abbreviateNumber(yahooWebSocketState.changePercent)}% ({yahooWebSocketState.change})
        </span>
      </div>

        {
          (ticker) && (
            <>
            <ChartComponent
              ticker={ticker}
              webSocprice={yahooWebSocketState.price}
              interval={interval}
              range={range}
              prePost={prePost}
              setWebSocketState={setYahooWebSocketState}
            />
            </>
          )
        }
          
      </div>

      <div className='flex flex-col items-start justify-start w-[50vw] h-full'>
        <NewsComponent ticker={ticker} />
        {/* Add the shadcn table for the stock screener fetch */}
        <div className='flex flex-col items-start justify-start w-full h-full mb-10'>
          {/* trigger table deploy */}
      
{/* 
        <ScreenComponent setTicker={setTicker} /> */}
        </div>
      </div>
      </div>
    </main>
  );
}
