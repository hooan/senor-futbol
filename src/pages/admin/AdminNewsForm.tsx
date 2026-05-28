import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCreateNews, useUpdateNews, useAdminNews } from '@/hooks/useAdmin'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Checkbox from '@/components/ui/Checkbox'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import type { CreateNewsInput, UpdateNewsInput } from '@/types/database'

export default function AdminNewsForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(id)

  const { data: articles } = useAdminNews()
  const createNews = useCreateNews()
  const updateNews = useUpdateNews()

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    is_published: false,
  })

  const [error, setError] = useState('')

  // Load article data if editing
  useEffect(() => {
    if (isEditing && articles) {
      const article = articles.find((a) => a.id === id)
      if (article) {
        setFormData({
          title: article.title,
          excerpt: article.excerpt || '',
          content: article.content,
          cover_image_url: article.cover_image_url || '',
          is_published: article.is_published,
        })
      }
    }
  }, [isEditing, id, articles])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be logged in')
      return
    }

    if (formData.title.length < 3) {
      setError('Title must be at least 3 characters')
      return
    }

    if (formData.content.length < 10) {
      setError('Content must be at least 10 characters')
      return
    }

    try {
      if (isEditing && id) {
        // Update existing article
        const input: UpdateNewsInput = {
          id,
          title: formData.title,
          excerpt: formData.excerpt || undefined,
          content: formData.content,
          cover_image_url: formData.cover_image_url || undefined,
          is_published: formData.is_published,
        }
        await updateNews.mutateAsync(input)
      } else {
        // Create new article
        const input: CreateNewsInput = {
          title: formData.title,
          excerpt: formData.excerpt || undefined,
          content: formData.content,
          cover_image_url: formData.cover_image_url || undefined,
          is_published: formData.is_published,
        }
        await createNews.mutateAsync({ userId: user.id, input })
      }

      // Navigate back to news management
      navigate('/admin/news')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article')
    }
  }

  const isPending = createNews.isPending || updateNews.isPending

  if (isEditing && !articles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-raw-black text-raw-white py-8 border-b-thick border-raw-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-4xl uppercase mb-2">
                {isEditing ? 'EDIT ARTICLE' : 'CREATE ARTICLE'}
              </h1>
              <p className="text-gray-300">
                {isEditing ? 'Update article details' : 'Write a new news article'}
              </p>
            </div>
            <Link to="/admin/news">
              <Button variant="secondary" size="small">
                ← BACK
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block font-semibold mb-2 uppercase text-sm">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., USA Advances to Quarter Finals"
                required
                maxLength={200}
              />
              <p className="text-sm text-gray-600 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block font-semibold mb-2 uppercase text-sm">
                Excerpt (Optional)
              </label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary for article cards..."
                rows={3}
                maxLength={300}
              />
              <p className="text-sm text-gray-600 mt-1">
                {formData.excerpt.length}/300 characters • Used in article previews
              </p>
            </div>

            {/* Cover Image */}
            <div>
              <label
                htmlFor="cover_image_url"
                className="block font-semibold mb-2 uppercase text-sm"
              >
                Cover Image URL (Optional)
              </label>
              <Input
                id="cover_image_url"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              <p className="text-sm text-gray-600 mt-1">
                Full URL to the cover image (will be displayed on article card and detail page)
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block font-semibold mb-2 uppercase text-sm">
                Content *
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your article content here..."
                rows={15}
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                {formData.content.length} characters • Supports plain text and line breaks
              </p>
            </div>

            {/* Publish Status */}
            <div className="border-t-3 border-gray-200 pt-6">
              <label className="block font-semibold mb-3 uppercase text-sm">
                Publishing Options
              </label>
              <Checkbox
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                label="Publish this article immediately"
              />
              <p className="text-sm text-gray-600 ml-7 mt-1">
                {formData.is_published
                  ? 'Article will be visible on the public news page'
                  : 'Save as draft (only visible in admin panel)'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-thick border-red-600 p-4">
                <p className="text-red-800 font-semibold">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button type="submit" size="large" disabled={isPending} className="flex-1">
                {isPending
                  ? 'SAVING...'
                  : isEditing
                  ? 'UPDATE ARTICLE'
                  : formData.is_published
                  ? 'PUBLISH ARTICLE'
                  : 'SAVE DRAFT'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={() => navigate('/admin/news')}
                disabled={isPending}
              >
                CANCEL
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border-thick border-blue-600 p-6">
          <h3 className="font-headline text-lg uppercase mb-4">WRITING TIPS</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>Title:</strong> Keep it short and catchy (50-80 characters ideal)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>Excerpt:</strong> Summarize the article in 1-2 sentences for previews
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>Content:</strong> Write clearly, use paragraphs, check for typos
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>Images:</strong> Use high-quality images relevant to the content
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>Drafts:</strong> Save as draft to review before publishing
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
