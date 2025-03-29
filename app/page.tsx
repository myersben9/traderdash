import ApexCharts from 'apexcharts'

interface StockData {
  Timestamp: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Symbol: string;
}



export default async function Home() {

  // # Fetch data from the fastapi backend
  try {
    const params = {
      'range': '1d',
      'interval': '5m',
      'ticker': 'AAPL',
    }
    // Get enviornment variablef or envrionment
    const env = process.env.APP_ENV;
    let url;

    if (env === 'production') {
      url = new URL('https://tradedash-backend-production.up.railway.app/');
    }
    else {
      url = new URL('http://127.0.0.1:8000/');
    }
    console.log('URL:', url);
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${url}api/py/get_data?${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    const data = await response.json();
    //  Construct into opject
    const StockData : StockData = data.map((item: any) => ({
      Timestamp: item.Timestamp,
      Open: item.Open,
      High: item.High,
      Low: item.Low,
      Close: item.Close,
      Volume: item.Volume,
      Symbol: item.Symbol,
    }));
    console.log('StockData:', StockData);
  }
  catch (error) {
    console.error('Error fetching data:', error);
  }
  // # Set up the chart
  return (
    <main className="">
      {/* Let set up our dashboard */}
      <h1>
        Welcome to tradedash!
      </h1>

    </main>
  );
}
