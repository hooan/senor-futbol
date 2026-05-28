import { usePublishedNews } from '@/hooks/useNews'
import NewsCard from '@/components/news/NewsCard'
import Loading from '@/components/ui/Loading'

export default function News() {
  const { data: news, isLoading } = usePublishedNews()
  
  // Separate featured (first) from rest
  const featuredNews = news?.[0]
  const otherNews = news?.slice(1)
  
  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-headline text-5xl md:text-6xl uppercase mb-4">
            LATEST NEWS
          </h1>
          <p className="font-body text-lg text-gray-700">
            Stay updated with World Cup 2026 news, announcements, and analysis
          </p>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loading size="large" text="Loading news..." />
            </div>
          ) : !news || news.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-xl text-gray-600">
                No news articles found
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured News */}
              {featuredNews && (
                <div>
                  <h2 className="font-headline text-2xl uppercase mb-6 pb-3 border-b-thick border-raw-black">
                    FEATURED
                  </h2>
                  <NewsCard news={featuredNews} featured />
                </div>
              )}
              
              {/* Other News */}
              {otherNews && otherNews.length > 0 && (
                <div>
                  <h2 className="font-headline text-2xl uppercase mb-6 pb-3 border-b-thick border-raw-black">
                    MORE NEWS
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherNews.map(article => (
                      <NewsCard key={article.id} news={article} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
