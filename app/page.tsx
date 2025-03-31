"use client";

import dynamic from 'next/dynamic'
import useSWR from 'swr'
import React from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fetcher = (url : string) => fetch(url).then((r) => r.json())
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartData {
  Timestamp: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Symbol: string;
}


export default function Home() {

  let [inpTicker, setInpTicker] = React.useState('AAPL');
  let [inpRange, setInpRange] = React.useState('1d');
  let [inpInterval, setInpInterval] = React.useState('5m');
  let [range, setRange] = React.useState('1d');
  let [interval, setInterval] = React.useState('5m');
  let [ticker, setTicker] = React.useState('AAPL');

  let params = {
    range: range,
    interval: interval,
    ticker: ticker,
  }

  let stringParams = new URLSearchParams(params).toString();
  let host;

  console.log(process.env.NEXT_PUBLIC_NODE_ENV);
  if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
    console.log('Production environment detected');
    host = 'https://nextjs-fastapi-starter-one-pi.vercel.app';
  }
  else {
    console.log('Development environment detected');
    host = 'http://127.0.0.1:8000';
  }


  let { data, error, isLoading } = useSWR(
    `${host}/api/py/get_chart_data?${stringParams}`,
    fetcher);
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <div>Loading...</div>

  let categories;
  if (params.range === '1d') {
    categories = data.map((item: ChartData) => {
      let date = new Date(item.Timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
  }
  
  // If the price is above 1 dollar for close, format the close prices to 2 decimal places, if not format to 4 decimal places
  let close = data.map((item: ChartData) => {
    let close = item.Close;
    if (close > 1) {
      return close.toFixed(2);
    }
    else {
      return close.toFixed(4);
    }
  });
  // let close = data.map((item: ChartData) => item.Close);

  let options : ApexCharts.ApexOptions = {
      theme: {
        mode: 'dark',
      },
      xaxis: {
        categories,
        tickAmount:10,
        tickPlacement: 'on',
        axisTicks: {
          show: false,
        },
      },
    };
  let series = [
      {
        name: "Close",
        data: close
      }
  ];
  return (
    <main className="flex flex-col">
      <div className='flex flex-col items-end justify-end'>
        <div className='flex flex-row items-end justify-end p-3'>
          <Input
            type="text"
            placeholder='AAPL'
            className="w-[80px] h-[50px] mb-4"
            value={inpTicker}
            onBlur={(e) => {
              setInpTicker(e.target.value);
            }}
          />
          <Select value={inpRange} onValueChange={(e) => {
            setInpRange(e);
          }}>
            <SelectTrigger className="w-[80px] h-[50px] mb-4 ml-2">
              <SelectValue defaultValue='1d'/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">
                1d
              </SelectItem>
              <SelectItem value="14d">
                14d
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={inpInterval} onValueChange={(e) => {
            setInpInterval(e);
          }}>
            <SelectTrigger className="w-[100px] h-[50px] mb-4 ml-2">
              <SelectValue defaultValue='1m'/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">
                1 minute
              </SelectItem>
              <SelectItem value="5m">
                5 minutes
              </SelectItem>
              <SelectItem value="15m">
                15 minutes
              </SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="w-[80px] h-[50px] mb-4 ml-2"
            onClick={() => {
              setTicker(inpTicker);
              setRange(inpRange);
              setInterval(inpInterval);
            }}
          > Submit
          </Button>
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
