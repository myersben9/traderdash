import useSWR from 'swr';
import { fetcher } from '@/app/utils';
import { ChartPoint } from '@/app/models';
import { NewsStateData } from '@/app/models';

type UseStockDataOptions = {
  ticker: string;
  chart?: boolean;
  news?: boolean;
  interval: string | null; 
  range: string;
  prePost: boolean;
};

interface StockFetchData {
    chartData: ChartPoint[];
    chartLoading: boolean;
    chartError: any;
    newsData: NewsStateData[];
    newsLoading: boolean;
    newsError: any;
}

export function useStockData({ ticker, chart = false, news = false, interval, range, prePost }: UseStockDataOptions) {
  const shouldFetchChart = chart && !!ticker;
  const shouldFetchNews = news && !!ticker;

  const getParams = () => {
    const params: Record<string, string> = { range, ticker, pre_post: prePost ? 'true' : 'false' };

    if (!(interval === null && range === 'max')) {
    // add the interval to the params
    params.interval = interval as string;
    } 

    return new URLSearchParams(params);
};

    const stringParams = getParams().toString();
    console.log(`/api/py/get_chart_data?${stringParams}`);

    if (shouldFetchChart){

        const { data: chartData, error: chartError, isLoading: chartLoading } = useSWR<ChartPoint[]>(
            shouldFetchChart ? `/api/py/get_chart_data?${stringParams}` : null,
            fetcher,
                {
                    refreshInterval: 100000,
                    revalidateOnFocus: false,
                }
            );
        return {
            chartData,
            chartLoading,
            chartError,
        };
    } else if (shouldFetchNews) {
        const { data: newsData, error: newsError, isLoading: newsLoading } = useSWR<NewsStateData[]>(
            shouldFetchNews ? `/api/py/get_ticker_news?ticker=${ticker}` : null,
            fetcher,
            {
                refreshInterval: 100000,
            }
        );


        return {
            newsData,
            newsLoading,
            newsError,
        };
        }
    return {
        chartData: [],
        chartLoading: false,
        chartError: null,
        newsData: [],
        newsLoading: false,
        newsError: null,
    }
}
