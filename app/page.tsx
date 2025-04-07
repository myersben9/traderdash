"use client";

// {FINISH BY TODAY GOAL}
// TODO - Make chart data able to stream through websockets ()
// TODO - Make date range by ticker
// TODO - Make Percentage change by ticker to update when it state changes
// TODO - Make buffer toggle slider for y axis zooming
// TOOD - Make chart not unzoom when mouse leaves

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

import dynamic from 'next/dynamic'
import useSWR from 'swr'
import React from 'react'
import { Search } from 'lucide-react';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getHost } from "@/app/constants"




const fetcher = (url : string) => fetch(url).then((r) => r.json())
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Write a function that takes in a timestamp, chartpoint[], currentPrice, and appends an updated row to chartpoint[] with the current price and the timestamp
// and then updates the chart with the new data
const updateChartData = (chartData: ChartPoint[], data : Record<any,any>) => {
  const newData = {
    Timestamp: data.Timestamp,
    Open: data.Open,
    High: data.High,
    Low: data.Low,
    Close: data.Close,
    Volume: data.Volume,
    Symbol: data.Symbol
  }
  chartData.push(newData);
  return chartData;
}


interface ChartPoint {
  Timestamp: string; // or use Date if the timestamp is a Date object
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Symbol: string;
}

interface WebsocketData {
  id: string;
  price: number;
  time: string;
  exchange: string;
  quoteType: string;
  changePercent: number;
  change: number;
  priceHint: number;
}



const validParams = [
  {"1d": "1m"}, 
  {"1d":"5m"}, 
  {"1d":"15m"}, 
  {"14d":"1h"}, 
  {"1mo":"1d"}, 
  {"max":null}
];

export default function Home() {
  const host = getHost();

  const abbreviateNumber = (number: number, decimals: number = 2): string => {
    const abbrev = ["K", "M", "B", "T"];
  
    for (let i = abbrev.length - 1; i >= 0; i--) {
  
      const size = Math.pow(10, (i + 1) * 3);
      if (Math.abs(number) >= size) {
        let shortened = Math.round((number * Math.pow(10, decimals)) / size) / Math.pow(10, decimals);
         if (shortened === 1000 && i < abbrev.length - 1) {
  
          shortened = 1;
          i++;
        }
        return `${shortened}${abbrev[i]}`;
      }
    }
    return number.toFixed(decimals);
  };

  const [range, setRange] = React.useState('1d');
  const [interval, setInterval] = React.useState<string | null>('1m');
  const [ticker, setTicker] = React.useState('AAPL');
  const [prePost, setPrePost] = React.useState(false);
  const [websocketState, setWebsocketState] = React.useState<Record<any,any>>(
    {
      id: 'AAPL',
      price: 0,
      time: '',
      exchange: '',
      quoteType: '',
      changePercent: 0,
      change: 0,
      priceHint: 0
    }
  );

  const [chartDataState, setChartData] = React.useState<ChartPoint[]>([]);

  // Basically what i want to do is to connect the websocket initially to the default ticker
  // Then i was to set up the connection and put data where it needs to go
  // If the ticker changes, i want to close the connection and open a new one

  const connectYlive = () => {
    const ws = new WebSocket(`ws://localhost:8000/ws`);
    ws.onopen = () => {
      console.log('WebSocket connection opened');
      const msg = {
        subscribe: [ticker]
      };
      ws.send(JSON.stringify(msg));
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.price) {
        setWebsocketState(data);
      }
    }
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    }
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    }
    return ws;
  }

  // Connect to the websocket when the component mount, but when ticker changes close the connection
  React.useEffect(() => {
    const ws = connectYlive();
    return () => {
      ws.close();
    }
  }
  , [ticker]);
  // Write a function to set the params
  const getParams = () => {
    const params: Record<string, string> = { range, ticker, pre_post: prePost ? 'true' : 'false' };
  
    if (!(interval === null && range === 'max')) {
      // add the interval to the params
      params.interval = interval as string;
    } 
  
    return new URLSearchParams(params);
  };


  const stringParams = getParams().toString();

  const params = getParams();
  const { data, error, isLoading } = useSWR(
    `${host}/api/py/get_chart_data?${stringParams}`,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        if (!data) return;
        // Update the chart data with the new data
        const newData = updateChartData(chartDataState, data);
        setChartData(newData);
      }
    }
  );;

  // if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <div>Loading...</div>



  const chartData = data.map((point: ChartPoint) => {
    return {
      Timestamp: point.Timestamp,
      Open: point.Open,
      High: point.High,
      Low: point.Low,
      Close: point.Close,
      Volume: point.Volume,
      Symbol: point.Symbol
    }
  });
  const close = chartData.map((point: ChartPoint) => point.Close);
  const open = chartData.map((point: ChartPoint) => point.Open);
  const categories = chartData.map((point: ChartPoint) => new Date(point.Timestamp).getTime());

  // Constat
  const statePercentChange = ((close[close.length - 1] - close[0]) / close[0]) * 100;
  const statePoints = websocketState!.price ? websocketState!.price - close[0] : close[close.length - 1] - close[0];
  const statePointsFormatted = abbreviateNumber(statePoints, 2);
  const statePercentChangeFormatted = abbreviateNumber(statePercentChange, 2);
  // Add correct + or - sign to the state points and percent change
  const statePointsText = statePoints > 0 ? `+${statePointsFormatted}` : `${statePointsFormatted}`;
  const statePercentChangeText = statePercentChange > 0 ? `+${statePercentChangeFormatted}` : `${statePercentChangeFormatted}`;
  const buffer = 0.01;
  const minValue = Math.min(...close) * (1 - buffer);
  const maxValue = Math.max(...close) * (1 + buffer);

  const options : ApexCharts.ApexOptions = {
      chart: {
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: false,
        },
        events: {
    
        },
      },
      annotations: {
        yaxis: [
          {
            y: chartData[0].Close,
            borderColor: '#808080', // Grey color
            label: {
              borderColor: '#808080', // Grey color for the label border
              style: {
                color: '#fff',
                background: '#808080', // Grey background for the label
              },
            },
          },
        ],
      },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          //  Get the date in dateime format for any range over one day, otherwise show the time should just be the time

          const time = new Date(categories[dataPointIndex]).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const date = new Date(categories[dataPointIndex]).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const price = series[seriesIndex][dataPointIndex].toFixed(2);
          const formatter = new Intl.NumberFormat('en-US', { 
            notation: 'compact' 
          });
          const volume = formatter.format(chartData[dataPointIndex].Volume)
          const open = chartData[dataPointIndex].Open.toFixed(2);
          const high = chartData[dataPointIndex].High.toFixed(2);
          const low = chartData[dataPointIndex].Low.toFixed(2);
          const close = chartData[dataPointIndex].Close.toFixed(2);

          const dayPercentChange = ((close - open) / open) * 100;
          const percentChange = ((close - chartData[0].Close) / chartData[0].Close) * 100;
          const percentChangeFormatted = abbreviateNumber(percentChange, 2);

          const percentChangeElement = document.getElementById('percentChange') as HTMLSpanElement;
          const newDate = document.getElementById('newDate') as HTMLSpanElement;
          const newTime = document.getElementById('newTime') as HTMLSpanElement;
          const newVolume = document.getElementById('newVolume') as HTMLSpanElement;
          const newOpen = document.getElementById('newOpen') as HTMLSpanElement;
          const newHigh = document.getElementById('newHigh') as HTMLSpanElement;
          const newLow = document.getElementById('newLow') as HTMLSpanElement;
          const newClose = document.getElementById('newClose') as HTMLSpanElement;
          const changeLabel = document.getElementById('changeLabel') as HTMLSpanElement;
          const openLabel = document.getElementById('openLabel') as HTMLSpanElement;
          const highLabel = document.getElementById('highLabel') as HTMLSpanElement;
          const lowLabel = document.getElementById('lowLabel') as HTMLSpanElement;
          const volumeLabel = document.getElementById('volumeLabel') as HTMLSpanElement;
          const closeLabel = document.getElementById('closeLabel') as HTMLSpanElement;

          // Remove hidden class from labels
          openLabel.classList.remove('hidden');
          highLabel.classList.remove('hidden');
          lowLabel.classList.remove('hidden');
          closeLabel.classList.remove('hidden');    
          volumeLabel.classList.remove('hidden');
          changeLabel.classList.remove('hidden');

          percentChangeElement.style.color = percentChange > 0 ? 'green' : 'red';

          percentChangeElement.innerText = `${percentChangeFormatted}%`;
          newDate.innerText = `${date}`;
          newTime.innerText = `${time}`;
          newVolume.innerText = `${volume}`;
          newOpen.innerText = `${open}`;
          newHigh.innerText = `${high}`;
          newLow.innerText = `${low}`;
          newClose.innerText = `${close}`;

          return '';
        },
      },
      xaxis: {
        tooltip: {
          enabled: false,
        },
        type: 'datetime',
        categories,
        tickAmount: 10,
        tickPlacement: 'on',
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: '#ffffff',
            fontSize: '12px',
          },
          datetimeUTC: false,
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM \'yy',
            day: 'dd MMM',
            hour: 'HH:mm'
          }
        }
      },
      grid: {
        yaxis: {
          lines: {
            show: false,
          }}
      },
      yaxis: {
        min: minValue,
        max: maxValue,
        labels: {
          style: {
            colors: '#ffffff',
            fontSize: '12px',
          },
          formatter: (value) => {
            // if price is less than 1 dollar show 4 decimal places
            if (value < 1) {
              return value.toFixed(4);
            }
            return value.toFixed(2);
          }
        }
      },
    };
  const series = [
      {
        name: "Close",
        data: close
      }
  ];
  return (
    <main className="flex flex-col">
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
                connectYlive
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
         {/* Format the day percentage state change and the day points with green red, number formatting fixed 2, and +- signs */}
          <div className={`flex flex-row items-left col-span-2 justify-start h-5`}>
              <span id="newDate" className='text-sm font-bold text-white ml-3'></span>
              <span id="newTime" className='text-sm font-bold text-white ml-3'></span>
          </div>
        </div>
        {/* Graph live opens and live percentages */}
        <div className={`flex flex-row ml-3 h-10`}>
          {/* If no current price, use last close */}
          {/* If it is green style it with a flash and then green if red style with flash then red */}
          <h2 id="liveOpen" className={`text-center text-2xl ${websocketState!.price && websocketState!.price > close[close.length - 1] ? 'text-green-500' : 'text-red-500'}`}>{websocketState!.price ? websocketState!.price.toFixed(2) : close[close.length - 1].toFixed(2)}</h2>

          <h2 className={`text-sm ml-3 ${statePoints > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {statePointsText}
          </h2>
          <h2 className={`text-sm font-bold text-gray-500 ml-3 ${statePercentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
            ({statePercentChangeText}%)
          </h2>
        </div>
        <div className='grid grid-cols-7 gap-4 mb-4 w-[820px]'>
          <div className={`flex flex-col justify-start h-5 min-w-[80px]`}>
            <span id="openLabel" className='hidden text-lg  text-white ml-3'>O:</span>
            <span id="highLabel" className='hidden text-lg text-white ml-3'>H:</span>
          </div>
          <div className={`flex flex-col items-end h-5 min-w-[80px]`}>
            <span id="newOpen" className='text-lg font-bold text-white ml-1'></span>             
            <span id="newHigh" className='text-lg font-bold text-white ml-3'></span>
          </div>
          <div className={`flex flex-col justify-start h-5 min-w-[80px]`}>
            <span id="lowLabel" className='hidden text-lg text-white ml-3'>L:</span>
            <span id="closeLabel" className='hidden text-lg text-white ml-3'>C:</span>
          </div>
          <div className={`flex flex-col items-end min-w-[80px] h-5`}>
            <span id="newLow" className='text-lg font-bold text-white ml-1'></span>
            <span id="newClose" className='text-lg font-bold text-white ml-3'></span>
            </div>
          <div className={`flex flex-col justify-start h-5 min-w-[80px]`}>
            <span id="volumeLabel" className='hidden text-lg text-white ml-3'>V:</span>
            <span id="changeLabel" className='hidden text-lg text-white ml-3'>Change:</span>
              </div>
          <div className={`flex flex-col items-end h-5 min-w-[80px]`}>
            <span id="newVolume" className='text-lg font-bold text-white ml-1'></span>
            <span id="percentChange" className='text-lg font-bold text-white ml-3'></span>
            </div>
        </div>
        
        <ApexChart
          type="line"
          series={series}
          options={options}
          height={500}
          width={700}
        />
          
      </div>
    </main>
  );
}
