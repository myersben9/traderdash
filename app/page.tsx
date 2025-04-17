// Write basic table that displays screened stocks
"use client"
import React, { useState, useEffect } from 'react'


export default function Home() {

    // Fetch from python backend daily stocks of interest
    const [stocks, setStocks] = useState<Array<Record<string, any>>>([])

    useEffect(() => {
        const fetchStocks = async () => {
            const response = await fetch('/api/py/get_daily_screen')
            if (response.ok) {
                const data = await response.json()
                setStocks(data)
                console.log(data)
            } else {
                console.error('Failed to fetch stocks')
            }
        }
        fetchStocks()
    }, [])
    return (
        <div>
            <h1>Daily Stocks</h1>
            <table className="table-auto">
                <thead >
                    <tr>
                        <th>Symbol</th>
                        <th>Float</th>
                        <th>Relative Volume</th>
                        <th>Bid</th>
                        <th>Ask</th>
                        <th>Change</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock: Record<string, any>) => (
                        <tr key={stock.symbol}>
                            <td>{stock.symbol}</td>
                            <td>{stock.float}</td>
                            <td>{stock.relativeVolume}</td>
                            <td>{stock.bid}</td>
                            <td>{stock.ask}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}