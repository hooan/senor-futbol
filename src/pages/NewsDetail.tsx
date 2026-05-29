import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useNewsArticle } from '@/hooks/useNews'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'

export default function NewsDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: news, isLoading } = useNewsArticle(id || '')
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <Loading size="large" text={t('common.loading')} />
      </div>
    )
  }
  
  if (!news) {
    return (
      <div className="min-h-screen bg-raw-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card>
            <h2 className="font-headline text-3xl uppercase mb-4">
              {t('news.articleNotFound')}
            </h2>
            <p className="font-body mb-6">
              {t('news.articleNotFoundDesc')}
            </p>
            <Link to="/news">
              <Button variant="primary">{t('news.backToNews')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }
  
  const publishedDate = news.published_at ? new Date(news.published_at) : new Date()
  const dateStr = format(publishedDate, 'MMMM d, yyyy')
  
  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/news" className="inline-flex items-center gap-2 font-body font-semibold uppercase text-sm text-raw-black hover:text-raw-blue mb-6">
            ← {t('news.backToNews')}
          </Link>
          
          <h1 className="font-headline text-4xl md:text-5xl uppercase leading-tight mb-6">
            {news.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center font-mono text-sm text-gray-600">
            {/* Source Name */}
            {news.source_name && (
              <>
                <div className="flex items-center gap-2">
                  <span className="uppercase font-semibold">{news.source_name}</span>
                </div>
                <span>•</span>
              </>
            )}
            {/* Date */}
            <div>{dateStr}</div>
            {/* Author (if manually created) */}
            {news.author && !news.source_name && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>{t('news.by')} {news.author.username}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Cover Image */}
      {news.cover_image_url && (
        <section className="border-b-thick border-raw-black">
          <div className="max-w-4xl mx-auto">
            <img 
              src={news.cover_image_url} 
              alt={news.title}
              className="w-full h-auto"
            />
          </div>
        </section>
      )}
      
      {/* Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated">
            {/* Excerpt */}
            {news.excerpt && (
              <div className="mb-8 pb-8 border-b-thick border-gray-300">
                <p className="font-body text-xl leading-relaxed text-gray-800">
                  {news.excerpt}
                </p>
              </div>
            )}
            
            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              {news.content.split('\n\n').map((paragraph, index) => {
                // Check if paragraph is a heading (starts with **)
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  const heading = paragraph.replace(/\*\*/g, '')
                  return (
                    <h2 key={index} className="font-headline text-2xl uppercase mt-8 mb-4">
                      {heading}
                    </h2>
                  )
                }
                
                return (
                  <p key={index} className="font-body text-base leading-relaxed mb-4">
                    {paragraph}
                  </p>
                )
              })}
            </div>
            
            {/* Source URL Link */}
            {news.source_url && (
              <div className="mt-8 pt-8 border-t-thick border-gray-300">
                <a 
                  href={news.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-body font-semibold uppercase text-sm text-raw-blue hover:underline"
                >
                  {t('news.readOriginal')} →
                </a>
              </div>
            )}
          </Card>
          
          {/* Back Button */}
          <div className="mt-8">
            <Link to="/news">
              <Button variant="secondary" size="large">
                ← {t('news.backToAllNews')}
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
