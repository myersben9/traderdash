"use client";

import dynamic from 'next/dynamic'
import useSWR from 'swr'
import React from 'react'
import { Search } from 'lucide-react';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getHost } from "@/app/constants"
import { set } from 'react-hook-form';

const fetcher = (url : string) => fetch(url).then((r) => r.json())
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

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


interface ChartPoint {
  Timestamp: string; // or use Date if the timestamp is a Date object
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Symbol: string;
}

interface ChartData {
  tick: ChartPoint[];
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

  const [range, setRange] = React.useState('1d');
  const [interval, setInterval] = React.useState<string | null>('1m');
  const [ticker, setTicker] = React.useState('AAPL');
  const [prePost, setPrePost] = React.useState(false);
  const [ohlcvMenu, setOhlcvMenu] = React.useState('hidden');
  const [dayPercentChange, setDayPercentChange] = React.useState(0);

  // Write a function to set the params
  const getParams = () => {
    const params: Record<string, string> = { range, ticker, pre_post: prePost ? 'true' : 'false' };
  
    if (!(interval === null && range === 'max')) {
      // add the interval to the params
      params.interval = interval as string;
    } 
  
    return new URLSearchParams(params);
  };

  
  // Write a function that updates the states for range, interval, ticker, prePost and dayPercentageChange
  const updateParams = (newParams: Record<string, string>) => {
    setRange(newParams.range || range);
    setInterval(newParams.interval || interval);
    setTicker(newParams.ticker || ticker);
    setPrePost(newParams.pre_post === 'true' || prePost);
    setDayPercentChange(parseFloat(newParams.dayPercentageChange) || dayPercentChange);
  };

  const stringParams = getParams().toString();

  const { data, error, isLoading } = useSWR(
    `${host}/api/py/get_chart_data?${stringParams}`,
    fetcher);;

  if (isLoading) return <div>Loading...</div>
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
  const categories = chartData.map((point: ChartPoint) => new Date(point.Timestamp).getTime());


  const dayPercentageChange = (close : number, open : number ) => {
    const change = ((close - open) / open) * 100;
    return change.toFixed(2);
  };

  const buffer = 0.05;
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
            mouseLeave: () => {
              // Hide the OHLCV menu when the mouse leaves the chart area
              setOhlcvMenu('hidden');
              console.log('Mouse left chart area'+  ohlcvMenu);
            },
            mouseMove: () => {
              // Show the OHLCV menu when the mouse moves over the chart area
              setOhlcvMenu('flex');
              console.log('Mouse moved over chart area' + ohlcvMenu);
            },
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
              maxLength={5}
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
            {ticker}
          </h1>
          <h2 className='text-lg font-bold text-gray-500 ml-3'>
            {range} {interval ? `(${interval})` : ''}
          </h2>
          <span id="newDate" className={`${ohlcvMenu} text-sm font-bold text-white ml-3`}></span>
          <span id="newTime" className={`${ohlcvMenu} text-sm font-bold text-white ml-3`}></span>
        </div>
        <div className='grid grid-cols-7 gap-4 mb-5'>
          <div className={`flex flex-col justify-start h-5 min-w-[80px]`}>
            <span id="openLabel" className={`${ohlcvMenu} text-md text-white ml-3`}>Open:</span>
            <span id="highLabel" className={`${ohlcvMenu} text-md text-white ml-3`}>High:</span>
          </div>
          <div className={`flex flex-col justify-start items-end h-5 w-[80px]`}>
            <span id="newOpen" className={`${ohlcvMenu} text-md font-bold text-white ml-1`}></span>             
            <span id="newHigh" className={`${ohlcvMenu} text-md font-bold text-white ml-3`}></span>
          </div>
          <div className={`flex flex-col justify-start h-5 w-[80px]`}>
            <span id="lowLabel" className={`${ohlcvMenu} text-md text-white ml-3`}>Low:</span>
            <span id="closeLabel" className={`${ohlcvMenu} text-md text-white ml-3`}>Close:</span>
          </div>
          <div className={`flex flex-col justify-start items-end h-5 w-[80px]`}>
            <span id="newLow" className={`${ohlcvMenu} text-md font-bold text-white ml-1`}></span>
            <span id="newClose" className={`${ohlcvMenu} text-md font-bold text-white ml-3`}></span>
            </div>
          <div className={`flex flex-col justify-start h-5 w-[80px]`}>
            <span id="volumeLabel" className={`${ohlcvMenu} text-md text-white ml-3`}>Volume:</span>
            <span id="changeLabel" className={`${ohlcvMenu} text-md text-white ml-3`}>Change:</span>
              </div>
          <div className={`flex flex-col justify-start items-end h-5 w-[80px]`}>
            <span id="newVolume" className={`${ohlcvMenu} text-md font-bold text-white ml-1`}></span>
            <span id="percentChange" className={`${ohlcvMenu} text-md font-bold text-white ml-3`}></span>
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
