import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { NewsWithAuthor } from '@/types/database'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface NewsCardProps {
  news: NewsWithAuthor
  featured?: boolean
}

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  const publishedDate = news.published_at ? new Date(news.published_at) : new Date()
  const dateStr = format(publishedDate, 'MMMM d, yyyy')
  const authorName = news.author?.username?.trim() || ''
  const normalizedAuthor = authorName.toLowerCase()
  const showAuthor = Boolean(
    authorName && !['anonymous', 'anonimous', 'anonimo', 'anónimo'].includes(normalizedAuthor)
  )
  
  return (
    <Link to={`/news/${news.id}`} className="block no-underline">
      <Card 
        variant={featured ? 'elevated' : 'default'}
        className="h-full hover:border-heavy transition-all cursor-pointer"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className={`font-headline uppercase leading-tight mb-2 ${featured ? 'text-3xl' : 'text-xl'}`}>
                {news.title}
              </h3>
            </div>
            {news.is_published ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="default">Draft</Badge>
            )}
          </div>
          
          {/* Excerpt */}
          {news.excerpt && (
            <p className={`font-body text-gray-700 ${featured ? 'text-lg' : 'text-base'}`}>
              {news.excerpt}
            </p>
          )}
          
          {/* Footer */}
          <div className="pt-3 border-t-thin border-gray-300 flex justify-between items-center">
            <div className="font-mono text-xs text-gray-600">
              {showAuthor && (
                <>
                  <span className="uppercase">{authorName}</span>
                  <span className="mx-2">•</span>
                </>
              )}
              <span>{dateStr}</span>
            </div>
            <div className="font-body text-sm text-raw-blue uppercase font-semibold">
              Read More →
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
