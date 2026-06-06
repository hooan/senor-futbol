import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLatestNews } from '@/hooks/useNews'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import NewsCard from '@/components/news/NewsCard'
import Loading from '@/components/ui/Loading'

export default function Home() {
  const { t } = useTranslation()
  const { data: latestNews, isLoading: newsLoading } = useLatestNews(3)
  
  return (
    <div className="bg-raw-white">
      {/* Hero Section */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="max-w-4xl">
            <h1 className="font-headline text-5xl sm:text-6xl md:text-8xl leading-none mb-6 uppercase tracking-tight">
              {t('home.title')}
            </h1>
            <p className="font-body text-xl leading-relaxed mb-8">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/fixtures/today">
                <Button variant="primary" size="large">
                  {t('home.todayMatches')}
                </Button>
              </Link>
              <Link to="/quinielas/create">
                <Button variant="secondary" size="large">
                  {t('home.createQuiniela')}
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
              <div className="font-body text-sm uppercase tracking-wider">{t('home.teams')}</div>
            </Card>
            <Card>
              <div className="font-headline text-4xl mb-2">64</div>
              <div className="font-body text-sm uppercase tracking-wider">{t('home.matches')}</div>
            </Card>
            <Card>
              <div className="font-headline text-4xl mb-2">16</div>
              <div className="font-body text-sm uppercase tracking-wider">{t('home.hostCities')}</div>
            </Card>
            <Card>
              <div className="font-headline text-4xl mb-2">3</div>
              <div className="font-body text-sm uppercase tracking-wider">{t('home.countries')}</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 sm:mb-12 gap-4 flex-wrap">
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight">
              {t('home.latestNews')}
            </h2>
            <Link to="/news">
              <Button variant="ghost">{t('home.viewAll')} →</Button>
            </Link>
          </div>
          
          {newsLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="medium" text={t('common.loading')} />
            </div>
          ) : latestNews && latestNews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {latestNews.map(article => (
                <NewsCard key={article.id} news={article} />
              ))}
            </div>
          ) : null}
          
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12 uppercase tracking-tight">
            {t('home.features')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Fixtures Preview */}
            <Card>
              <h3 className="font-headline text-2xl mb-4 uppercase">{t('home.fixturesTitle')}</h3>
              <p className="font-body mb-6">
                {t('home.fixturesDesc')}
              </p>
              <Link to="/fixtures" className="font-body font-semibold uppercase text-sm text-raw-blue hover:underline">
                {t('home.viewFixtures')} →
              </Link>
            </Card>

            {/* Quinielas Preview */}
            <Card className="bg-raw-black text-raw-white">
              <h3 className="font-headline text-2xl mb-4 uppercase">{t('quinielas.title')}</h3>
              <p className="font-body mb-6">
                {t('home.quinielasDesc')}
              </p>
              <Link to="/quinielas" className="font-body font-semibold uppercase text-sm text-raw-white hover:underline">
                {t('home.exploreQuinielas')} →
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
