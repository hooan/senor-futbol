import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminNews, useDeleteNews, useTogglePublish } from '@/hooks/useAdmin'
import { format } from 'date-fns'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

export default function AdminNews() {
  const { data: articles, isLoading } = useAdminNews()
  const deleteNews = useDeleteNews()
  const togglePublish = useTogglePublish()

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!articleToDelete) return

    try {
      await deleteNews.mutateAsync(articleToDelete)
      setDeleteModalOpen(false)
      setArticleToDelete(null)
    } catch (err) {
      console.error('Failed to delete article:', err)
    }
  }

  const handleTogglePublish = async (id: string) => {
    try {
      await togglePublish.mutateAsync(id)
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
    }
  }

  const confirmDelete = (id: string) => {
    setArticleToDelete(id)
    setDeleteModalOpen(true)
  }

  if (isLoading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-4xl uppercase mb-2">NEWS MANAGEMENT</h1>
              <p className="text-gray-300">{articles?.length || 0} articles total</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/news/create">
                <Button size="large">+ NEW ARTICLE</Button>
              </Link>
              <Link to="/admin">
                <Button variant="secondary" size="small">
                  ← DASHBOARD
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Articles List */}
        {!articles || articles.length === 0 ? (
          <Card className="text-center py-16">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={3}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-headline text-xl uppercase mb-2">NO ARTICLES YET</h3>
            <p className="text-gray-600 mb-6">Create your first news article to get started</p>
            <Link to="/admin/news/create">
              <Button>CREATE ARTICLE</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-headline text-xl uppercase mb-2 truncate">
                          {article.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="font-mono">by @{article.author?.username}</span>
                          <span>•</span>
                          <span>
                            {article.published_at
                              ? format(new Date(article.published_at), 'MMM d, yyyy')
                              : 'Not published'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={article.is_published ? 'success' : 'warning'}>
                        {article.is_published ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                    </div>

                    {article.excerpt && (
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">{article.excerpt}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created {format(new Date(article.created_at), 'MMM d, yyyy')}</span>
                      {article.updated_at !== article.created_at && (
                        <>
                          <span>•</span>
                          <span>
                            Updated {format(new Date(article.updated_at), 'MMM d, yyyy')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Link to={`/news/${article.id}`} className="flex-1 md:flex-none">
                      <Button variant="secondary" size="small" className="w-full">
                        VIEW
                      </Button>
                    </Link>
                    <Link to={`/admin/news/edit/${article.id}`} className="flex-1 md:flex-none">
                      <Button size="small" className="w-full">
                        EDIT
                      </Button>
                    </Link>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleTogglePublish(article.id)}
                      disabled={togglePublish.isPending}
                      className="flex-1 md:flex-none"
                    >
                      {article.is_published ? 'UNPUBLISH' : 'PUBLISH'}
                    </Button>
                    <Button
                      size="small"
                      variant="destructive"
                      onClick={() => confirmDelete(article.id)}
                      disabled={deleteNews.isPending}
                      className="flex-1 md:flex-none"
                    >
                      DELETE
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setArticleToDelete(null)
        }}
        title="DELETE ARTICLE?"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Are you sure you want to delete this article? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteNews.isPending}
              className="flex-1"
            >
              {deleteNews.isPending ? 'DELETING...' : 'YES, DELETE'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false)
                setArticleToDelete(null)
              }}
              disabled={deleteNews.isPending}
              className="flex-1"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
