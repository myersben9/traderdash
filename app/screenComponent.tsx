"use client"

import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/app/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ScreenComponent(
    { setTicker }: { setTicker: (ticker: string) => void } // Pass setTicker as a prop
) {
       // Fetch from python backend daily stocks of interest
  const [stocks, setStocks] = React.useState<Array<Record<string, any>>>([])
  const { data, error, isLoading } = useSWR(
    `/api/py/get_daily_screen`, 
    fetcher, 
    {
    refreshInterval: 10000, // Refresh every 10 seconds
  });

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-2xl font-bold text-white">Loading...</h1>
        <div className="loader"></div>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-2xl font-bold text-white">Loading...</h1>
        <div className="loader"></div>
      </div>
    )
  }
  if (error) {
    return <>Error Loading Stocks</>
  }
    // Prevent too many re-renders when setting stocks
    if (JSON.stringify(data) !== JSON.stringify(stocks)) {
        setStocks(data);
    }

    

    return (
        <div className='flex flex-col items-start justify-start w-[50vw] h-full'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Bid</TableHead>
              <TableHead>Ask</TableHead>
              <TableHead>Relative Volume </TableHead>
              <TableHead>Float</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock, index) => (
              <TableRow key={index}>
                <TableCell 
                  className="font-medium text-white cursor-pointer"
                  onClick={() => setTicker(stock.symbol)}
                >
                  {stock.symbol}
                </TableCell>
                <TableCell>{stock.currentPrice}</TableCell>
                <TableCell>{stock.bid}</TableCell>
                <TableCell>{stock.ask}</TableCell>
                <TableCell>{stock.relativeVolume}</TableCell>
                <TableCell>{stock.floatShares}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
    )
}