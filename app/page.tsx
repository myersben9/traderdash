"use client";

// {FINISH BY TODAY GOAL}
// TODO - Create live newsfeed component that updates every 5 seconds
// TODO - Make images work, make links for news clickable, 
// TODO - Add adequate loading and error handling for different inputs for ticker
// TODO - Add loading and error handling for websocket connection/ fetches with toasts
// TODO - Make buffer adjustable on the data in the range, so data goes outside of the chart when buffer is increased

// {COMING UP}
// TODO - Make chart component resizable to fullscreen, mobile, and different sizes, everything repsonsive
// TODO - Add candelstick chart toggle button
// TODO - ADD VWAP, EMA, SMA, and other indicators
// TODO - Add volume chart below the main chart with green and red by selling
// TODO - Add news and other data in widget from stocks that appear on scanner and other general news
// TODO - Add a scanner for stocks that are moving up 30%, are on the nasdaq, have a float of less than 5 million, have a 5x relative volume, priced 3-20 dollars
// TODO - Add feature to log in and track bots and trade with hotkeys on user accounts
// TODO - Add ability to draw lines on chart with mouse and visualize strategies / stop losses / profit taking
// TODO - Add active trade tracking and metrics for trades


import React from 'react'
import { Search } from 'lucide-react';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/app/useWebSocket"
import ChartComponent from '@/app//chartComponent';
import useSWR from 'swr';
import { fetcher, abbreviateNumber, formatPrice } from '@/app/utils';



interface NewsStateData {
  id: string;
  content: NewsStateContent;
  provider: Record<string, string>;
  canonicalUrl: Record<string, string>;
  clickThroughUrl: Record<string, string>;
  metadata: Record<string, string>;
  finance: Record<string, string>;
  storyline: any | null;
}

interface NewsStateContent {
  title: string;
  contentType: string;
  summary: string;
  date: string;
  link: string;
  source: string;
  pubDate: string;
  displayTime: string;
  thumbnail: Thumbnail;
}

interface Thumbnail {
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  caption: string;
  resolutions: ThumbnailResolution[];

}

interface ThumbnailResolution {
  url: string;
  width: number;
  height: number;
  tag: string;
}

export default function Home() {

  const [range, setRange] = React.useState('1d');
  const [interval, setInterval] = React.useState<string | null>('1m');
  const [ticker, setTicker] = React.useState('AAPL');
  const [prePost, setPrePost] = React.useState(false);
  const websocketState = useWebSocket(ticker);

  // Make useSWR hook to fetch news data 
  const { data, error, isLoading } = useSWR(`/api/py/get_ticker_news?ticker=${ticker}`, 
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 5 seconds
    }
  );
  // Parse data into NewsState if no error and data is not undefined
  // Map the content in each dict in the list of data
  if (!data) {
    console.log('No data available');
  }
  const newsData = data && !error ? data.map((news: NewsStateData) => {
    return {
      title: news.content.title,
      contentType: news.content.contentType,
      summary: news.content.summary,
      date: news.content.date,
      link: news.content.link,
      source: news.content.source,
      pubDate: news.content.pubDate,
      displayTime: news.content.displayTime,
      // thumbnail: news.content.thumbnail.resolutions[0]?.url || null,
    }
  }) : [];
  if (error) {
    console.error('Error fetching news data:', error);
  }
  // Log loading state
  if (isLoading) {
    console.log('Loading news data...');
  }
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
          {/* Replace selects with ADJS */}
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
            ${websocketState.change > 0 ? 'text-green-500' : 'text-red-500'}
          `}>{websocketState.price}</h2>
        </div>
        <div className="flex items-center text-left space-x-1 ml-3">
        <span className={`
            text-xs 
            ${websocketState.change > 0 ? 'text-green-500' : 'text-red-500'}
          `}>
            {websocketState.change > 0 ? '▲' : '▼'}
          </span>
        <span className={`
            text-xs font-bold 
            ${websocketState.change > 0 ? 'text-green-500' : 'text-red-500'}
          `}>
          {abbreviateNumber(websocketState.changePercent)}% ({abbreviateNumber(websocketState.change)})
        </span>
      </div>

        {
          (ticker) && (
            <>
           {/* Add vertical slider to left of chart component that controls the buffer of the graph */}
            <ChartComponent
              ticker={ticker}
              interval={interval}
              range={range}
              prePost={prePost}
              websocketState={websocketState}
            />
            </>
          )
        }
          
      </div>
      {/* Make news component that displays most recent news for the ticker */}
      <div className='flex flex-col items-start justify-start w-[50vw] h-full overflow-y-scroll'>
        <div className='flex flex-row items-start justify-start p-3'>
          <h1 className='text-2xl font-bold text-white'>
            News
          </h1>
        </div>
        <div className='flex flex-col items-start justify-start w-full h-full overflow-y-scroll'>
          {newsData.map((news: NewsStateContent, index: number) => (
            <div key={index} className='flex flex-col items-start justify-start p-3 border-b border-gray-700'>

              {/* <img
                src={news.thumbnail.originalUrl}
                alt="news-thumbnail"
                className="w-24 h-24 object-cover rounded-lg mr-4 border border-gray-600"
                width={news.thumbnail.originalWidth}
                height={news.thumbnail.originalHeight}
              /> */}
              <a href={news.link} target="_blank" rel="noopener noreferrer" className='text-lg font-bold text-white hover:text-blue-500'>
                {news.title}
              </a>
              <p className='text-sm font-bold text-gray-500'>{news.source}</p>
              <p className='text-sm font-bold text-gray-500'>{news.date}</p>
              <p className='text-sm font-bold text-gray-500'>{news.summary}</p>
            </div>
          ))}
          {newsData.length === 0 && (
            <div className='flex flex-col items-start justify-start p-3'>
              <p className='text-sm font-bold text-gray-500'>No news available</p>
            </div>
          )}

        </div>
      </div>
      </div>
    </main>
  );
}
