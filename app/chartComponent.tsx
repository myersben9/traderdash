"use client";

import dynamic from 'next/dynamic'
import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr'
import { WebSocketState } from '@/app/models';
import { getHost } from "@/app/constants"
import { ChartPoint } from '@/app/models';

const host = getHost();
const fetcher = (url : string) => fetch(url).then((r) => r.json())
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });


const ChartComponent = ({
    ticker,
    interval,
    range,
    prePost,
    websocketState
}: {
    ticker: string;
    interval: string | null;
    range: string;
    prePost: boolean;
    websocketState: WebSocketState;
}
) => {
    const xAxisRange = useRef<{ min: number; max: number } | null>(null);

    // Reset zoom when relevant props change
    useEffect(() => {
        xAxisRange.current = null;
    }, [ticker, interval, range, prePost]);

    const getParams = () => {
        const params: Record<string, string> = { range, ticker, pre_post: prePost ? 'true' : 'false' };
      
        if (!(interval === null && range === 'max')) {
          // add the interval to the params
          params.interval = interval as string;
        } 
      
        return new URLSearchParams(params);
      };
    
    
      const stringParams = getParams().toString();
      const { data, error, isLoading } = useSWR(
        `${host}/api/py/get_chart_data?${stringParams}`,
        fetcher,
        {
            // Refresh data for every interval (right now just do 1m)
            refreshInterval: 60000,
        //   revalidateOnFocus: false,
        //   onSuccess: (data) => {
        //     if (data) {
              
        //     }
        //   }
        }
      );;
      // if (isLoading) return <div>Loading...</div>
      if (error) return <div>Error: {error.message}</div>
      if (!data) return <div>Loading...</div>
      if (isLoading) return <div>Loading...</div>
      
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

  const categoriesLast = categories[categories.length - 1];
//   Turn into dates
const categoriesDate = new Date(categoriesLast);    
const websocketDate = new Date(parseInt(websocketState.time));
console.log(categoriesDate, "categoriesDate");
console.log(websocketDate, "websocketDate");
  console.log(websocketState.price)


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
            zoomed: (chartContext, { xaxis }) => {
              xAxisRange.current = { min: xaxis.min, max: xaxis.max };
            }
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
        min: xAxisRange.current?.min,
        max: xAxisRange.current?.max,
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
        <>
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
        </>
  );
}

export default React.memo(ChartComponent, (prevProps, nextProps) => {
    return (
      prevProps.ticker === nextProps.ticker &&
      prevProps.interval === nextProps.interval &&
      prevProps.range === nextProps.range &&
      prevProps.prePost === nextProps.prePost
    );
  });
