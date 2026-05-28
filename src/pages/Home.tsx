import { Link } from 'react-router-dom'
import { useLatestNews } from '@/hooks/useNews'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import NewsCard from '@/components/news/NewsCard'
import Loading from '@/components/ui/Loading'

export default function Home() {
  const { data: latestNews, isLoading: newsLoading } = useLatestNews(3)
  
  return (
    <div className="bg-raw-white">
      {/* Hero Section */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl">
            <h1 className="font-headline text-6xl md:text-8xl leading-none mb-6 uppercase tracking-tight">
              FIFA WORLD CUP 2026
            </h1>
            <p className="font-body text-xl leading-relaxed mb-8">
              Your ultimate source for World Cup 2026 news, fixtures, standings, and quinielas. 
              Create betting pools, compete with friends, and follow every match.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/fixtures/today">
                <Button variant="primary" size="large">
                  TODAY'S MATCHES
                </Button>
              </Link>
              <Link to="/quinielas/create">
                <Button variant="secondary" size="large">
                  CREATE QUINIELA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="font-headline text-4xl mb-2">32</div>
              <div className="font-body text-sm uppercase tracking-wider">TEAMS</div>
            </Card>
            <Card>
              <div className="font-headline text-4xl mb-2">64</div>
              <div className="font-body text-sm uppercase tracking-wider">MATCHES</div>
            </Card>
            <Card>
              <div className="font-headline text-4xl mb-2">16</div>
              <div className="font-body text-sm uppercase tracking-wider">HOST CITIES</div>
            </Card>
            <Card>
              <div className="font-headline text-4xl mb-2">3</div>
              <div className="font-body text-sm uppercase tracking-wider">COUNTRIES</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-headline text-4xl uppercase tracking-tight">
              LATEST NEWS
            </h2>
            <Link to="/news">
              <Button variant="ghost">View All →</Button>
            </Link>
          </div>
          
          {newsLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="medium" text="Loading news..." />
            </div>
          ) : latestNews && latestNews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {latestNews.map(article => (
                <NewsCard key={article.id} news={article} />
              ))}
            </div>
          ) : null}
          
          <h2 className="font-headline text-4xl mb-12 uppercase tracking-tight">
            FEATURES
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Fixtures Preview */}
            <Card>
              <h3 className="font-headline text-2xl mb-4 uppercase">FIXTURES & RESULTS</h3>
              <p className="font-body mb-6">
                Follow all 64 World Cup matches from group stage to the final. Get live updates, scores, and match schedules.
              </p>
              <Link to="/fixtures" className="font-body font-semibold uppercase text-sm text-raw-blue hover:underline">
                VIEW FIXTURES →
              </Link>
            </Card>

            {/* Quinielas Preview */}
            <Card className="bg-raw-black text-raw-white">
              <h3 className="font-headline text-2xl mb-4 uppercase">QUINIELAS</h3>
              <p className="font-body mb-6">
                Create prediction pools, compete with friends, and climb the leaderboard. No registration required to join!
              </p>
              <Link to="/quinielas" className="font-body font-semibold uppercase text-sm text-raw-white hover:underline">
                EXPLORE QUINIELAS →
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
