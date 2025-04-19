// import fetcher
import useSWR from 'swr';
import { fetcher } from '@/app/utils';
import { NewsStateData } from '@/app/models';

export default function NewsComponent({ ticker }: { ticker: string }) {
    const { data, error, isLoading } = useSWR(`/api/py/get_ticker_news?ticker=${ticker}`, 
        fetcher,
        {
          refreshInterval: 10000, 
        }
      );
      if (error) {
        return <>Error Loading News</>
      }
      if (!data) {
        return <>Loading...</>
      }
    
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-2xl font-bold text-white">Loading...</h1>
            <div className="loader"></div>
          </div>
        )
      }
      return (

              <div className='flex flex-col items-start justify-start w-[50vw] h-full'>
                <div className='flex flex-row items-start justify-start p-3'>
                  <h1 className='text-2xl font-bold text-white'>
                    News
                  </h1>
                </div>
                {/* Make a shadcn component card */}
                <div className='flex flex-col items-start justify-start w-full h-full overflow-y-scroll mb-5'>
                  {data?.map((news: NewsStateData, index: number) => (
                    <div key={index} className='flex flex-col items-start justify-start p-3 border-b border-gray-700'>
        
                      {/* <img
                        src={news.thumbnail.originalUrl}
                        alt="news-thumbnail"
                        className="w-24 h-24 object-cover rounded-lg mr-4 border border-gray-600"
                        width={news.thumbnail.originalWidth}
                        height={news.thumbnail.originalHeight}
                      /> */}
                      
                      <a href={news.content.canonicalUrl.url} target="_blank" rel="noopener noreferrer" className='text-lg font-bold text-white hover:text-blue-500'>
                        {news.content.title}
                      </a>
                      <p className='text-sm font-bold text-gray-500'>{news.content.summary}</p>
                    </div>
                  ))}
                  {data.length === 0 && (
                    <div className='flex flex-col items-start justify-start p-3'>
                      <p className='text-sm font-bold text-gray-500'>No news available</p>
                    </div>
                  )}
        
                </div>
                </div>
      )
}