"use client";

import dynamic from 'next/dynamic'
import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr'
import { WebSocketState } from '@/app/models';
import { getHost } from "@/app/constants"
import { ChartPoint } from '@/app/models';
import { abbreviateNumber } from './utils';
import { Slider } from "@/components/ui/slider"
import { fetcher } from './utils';
import { PricingData } from '@/proto/pricingData';

const host = getHost();

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });


const ChartComponent = ({
    ticker,
    interval,
    range,
    prePost,
    chartType = 'line',
}: {
    ticker: string;
    interval: string | null;
    range: string;
    prePost: boolean;
    chartType: string;
}
) => {
    const [bufferPercent, setBufferPercent] = useState(1); // 1% default
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
        `/api/py/get_chart_data?${stringParams}`,
        fetcher,
        {
            // Refresh data for every interval (right now just do 1m)
            refreshInterval: 1000,
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
  // Write a use effect that prints the latest time of the close when data changes

  const buffer = bufferPercent / 100;
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
            },
            mouseLeave: () => {
              const fields = [
                'newOpen',
                'newHigh',
                'newLow',
                'newClose',
                'newVolume',
                'percentChange'
              ];
            
              fields.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = '--';
              });
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

          const percentChange = document.getElementById('percentChange') as HTMLSpanElement;
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

          const percentChangeValue = abbreviateNumber((price - open) / open * 100,2);


          newDate.innerText = `${date}`;
          newTime.innerText = `${time}`;
          newVolume.innerText = `${volume}`;
          newOpen.innerText = `${open}`;
          newHigh.innerText = `${high}`;
          newLow.innerText = `${low}`;
          newClose.innerText = `${close}`;
          percentChange.innerText = `${percentChangeValue}%`;

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
          <div
    onMouseLeave={() => {
      const fields = [
        'newOpen',
        'newHigh',
        'newLow',
        'newClose',
        'newVolume',
        'percentChange'
      ];
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = '--';
      });
    }}
  >
        
        <div id="tooltip-apex" className="flex items-center gap-4 text-white text-sm font-medium px-4 py-2 rounded-md shadow-md w-fit">
          <div className="flex items-center gap-1">
            <span id="openLabel" className="text-gray-400">O:</span>
            <span id="newOpen">--</span>
          </div>
          <div className="flex items-center gap-1">
            <span id="highLabel" className="text-gray-400">H:</span>
            <span id="newHigh">--</span>
          </div>
          <div className="flex items-center gap-1">
            <span id="lowLabel" className="text-gray-400">L:</span>
            <span id="newLow">--</span>
          </div>
          <div className="flex items-center gap-1">
            <span id="closeLabel" className="text-gray-400">C:</span>
            <span id="newClose">--</span>
          </div>
          <div className="flex items-center gap-1">
            <span id="volumeLabel" className="text-gray-400">V:</span>
            <span id="newVolume">--</span>
          </div>
          <div className="flex items-center gap-1">
            <span id="changeLabel" className="text-gray-400">Change:</span>
            <span id="percentChange">--</span>
          </div>
      </div>
      <div className='flex flex-row items-center justify-start mb-4 ml-3'>
      <div className='w-10 flex justify-center'>
      <Slider
        defaultValue={[1]} // 1%
        min={0}
        max={20} // up to 20% buffer
        step={1}
        orientation='vertical'
        className='h-36 w-4 relative flex items-center bg-white rounded-full'
        onValueChange={(value) => setBufferPercent(value[0])}
      />
      </div>
      {
        chartType === 'line' ? (
          <ApexChart
            type="line"
            series={series}
            options={options}
            height={500}
            width={700}
          />
        ) : (
          <ApexChart
            type="candlestick"
            series={[
              {
                data: chartData.map((point: ChartPoint) => ({
                  x: new Date(point.Timestamp).getTime(),
                  y: [point.Open, point.High, point.Low, point.Close],
                })),
              },
            ]}
            options={{
              ...options,
              chart: {
                ...options.chart,
                type: 'candlestick',
              },
            }}
            height={500}
            width={700}
          />
        )
      }
        {/* <ApexChart
          type="line"
          series={series}
          options={options}
          height={500}
          width={700}
        /> */}
      </div> 
        </div>
  );
}

export default React.memo(ChartComponent, (prevProps, nextProps) => {
    return (
      prevProps.ticker === nextProps.ticker &&
      prevProps.interval === nextProps.interval &&
      prevProps.range === nextProps.range &&
      prevProps.prePost === nextProps.prePost &&
      prevProps.chartType === nextProps.chartType
    );
  });
