"use client";

import dynamic from 'next/dynamic'
import useSWR from 'swr'
import React, { MutableRefObject } from 'react'
import { Search } from 'lucide-react';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getHost } from "@/app/constants"


const fetcher = (url : string) => fetch(url).then((r) => r.json())
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

  // Write a function to set the params
  const getParams = () => {
    const params: Record<string, string> = { range, ticker };
  
    if (!(interval === null && range === 'max')) {
      // add the interval to the params
      params.interval = interval as string;
    } 
  
    return new URLSearchParams(params);
  };


  const stringParams = getParams().toString();

  const { data, error, isLoading } = useSWR(
    `${host}/api/py/get_chart_data?${stringParams}`,
    fetcher);;

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <div>Loading...</div>

  const getChartData = () => {
    // Map data into ChartDataObject
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
    return chartData;
  }
  const chartData = getChartData();
  const close = chartData.map((point: ChartPoint) => point.Close);
  const categories = chartData.map((point: ChartPoint) => new Date(point.Timestamp).getTime());

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
      yaxis: {
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
      <div className='flex flex-col items-start justify-start'>
        <div className='flex flex-row items-end justify-start p-3'>
            <div className='flex flex-row items-center justify-end mr-3'>
            <Input
              type="text"
              placeholder='GOOGL'
              className="w-[100px] h-[50px] mb-4"
              name="ticker"
              defaultValue={ticker}
              maxLength={5}
              onBlur={(e) => {
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
                setRange('1d');
                setInterval('1m');
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
        </div>
        <div className='flex flex-row items-center justify-start mb-4 ml-3'>

          <h1 className='text-2xl font-bold text-white'>
            {ticker}
          </h1>
          <h2 className='text-lg font-bold text-gray-500 ml-3'>
            {range} {interval ? `(${interval})` : ''}
          </h2>
        </div>
        <ApexChart
          type="line"
          series={series}
          options={options}
          height={700}
          width={700}
        />
          
      </div>
    </main>
  );
}
