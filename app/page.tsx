'use client'

import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { Input } from "@/components/ui/input"

 
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

  let params = {
    'range': '1d',
    'interval': '5m',
    'ticker': 'AAPL',
  }

  let stringParams = new URLSearchParams(params).toString();
  let host;

  const env = process.env.APP_ENV;

  if (env === 'production') {
    host = 'https://nextjs-fastapi-starter-one-pi.vercel.app';
  }
  else {
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
      },
    };
  let series = [
      {
        name: "series-1",
        data: close
      }
  ];
  return (
    <main className="flex flex-col p-24">
      <div className='flex flex-col items-end justify-end'>
        <div className='flex flex-col items-end justify-end'>
        <Input
          type="text"
          placeholder="AAPL"
          className="w-[80px] h-[50px] mb-4"
        />
        <ApexChart
          type="line"
          series={series}
          options={options}
          height={700}
          width={700}
        />
        </div>
      </div>
    </main>
  );
}
