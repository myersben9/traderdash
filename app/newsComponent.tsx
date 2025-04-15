
import { NewsStateData } from '@/app/models';
import { useStockData } from '@/app/useStockData';

export default function NewsComponent({ ticker, interval, range, prePost }: { ticker: string, interval: string | null, range: string, prePost: boolean }) {
    
  const { newsData, newsLoading } = useStockData({
    ticker,
    news: true,
    interval,
    range,
    prePost,
  });

  if (!newsData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-white">Loading...</h1>
      </div>
    );
  }
    return (
        <div className="news-container">
        {newsData.map((newsItem, index) => (
            <div key={index} className="news-item">
            <h3>{newsItem.content.title}</h3>
            <p>{newsItem.content.summary}</p>
            {/* <a href={newsItem.clickThroughUrl.url} target="_blank" rel="noopener noreferrer">Read more</a> */}
            </div>
        ))}
        </div>
    );
    }