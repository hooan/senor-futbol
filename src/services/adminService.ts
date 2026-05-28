import type { News, CreateNewsInput, UpdateNewsInput, User } from '@/types/database'
import { mockNews } from '@/data/mockNews'

// Simulate API delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory storage for demo (in real app, this would be Supabase)
let newsStore = [...mockNews]
let newsIdCounter = mockNews.length + 1

// Mock admin user for testing
const mockAdminUser: User = {
  id: 'admin-1',
  username: 'admin',
  avatar_url: null,
  is_admin: true,
  created_at: new Date().toISOString(),
}

// Admin Service
export const adminService = {
  // ============= NEWS MANAGEMENT =============

  // Get all news (including unpublished)
  async getAllNews(): Promise<News[]> {
    await delay()
    return newsStore.map((news) => ({
      ...news,
      author: mockAdminUser,
    }))
  },

  // Create news article
  async createNews(userId: string, input: CreateNewsInput): Promise<News> {
    await delay()

    const newArticle: News = {
      id: `news-${newsIdCounter++}`,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt || null,
      author_id: userId,
      cover_image_url: input.cover_image_url || null,
      is_published: input.is_published,
      published_at: input.is_published ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: mockAdminUser,
    }

    newsStore.unshift(newArticle)
    return newArticle
  },

  // Update news article
  async updateNews(input: UpdateNewsInput): Promise<News> {
    await delay()

    const index = newsStore.findIndex((n) => n.id === input.id)
    if (index === -1) {
      throw new Error('Article not found')
    }

    const article = newsStore[index]
    const wasUnpublished = !article.is_published
    const nowPublished = input.is_published === true

    const updatedArticle: News = {
      ...article,
      title: input.title !== undefined ? input.title : article.title,
      content: input.content !== undefined ? input.content : article.content,
      excerpt: input.excerpt !== undefined ? input.excerpt : article.excerpt,
      cover_image_url:
        input.cover_image_url !== undefined ? input.cover_image_url : article.cover_image_url,
      is_published: input.is_published !== undefined ? input.is_published : article.is_published,
      published_at:
        wasUnpublished && nowPublished ? new Date().toISOString() : article.published_at,
      updated_at: new Date().toISOString(),
    }

    newsStore[index] = updatedArticle
    return updatedArticle
  },

  // Delete news article
  async deleteNews(id: string): Promise<void> {
    await delay()

    const index = newsStore.findIndex((n) => n.id === id)
    if (index === -1) {
      throw new Error('Article not found')
    }

    newsStore.splice(index, 1)
  },

  // Toggle publish status
  async togglePublish(id: string): Promise<News> {
    await delay()

    const index = newsStore.findIndex((n) => n.id === id)
    if (index === -1) {
      throw new Error('Article not found')
    }

    const article = newsStore[index]
    const updatedArticle: News = {
      ...article,
      is_published: !article.is_published,
      published_at: !article.is_published ? new Date().toISOString() : article.published_at,
      updated_at: new Date().toISOString(),
    }

    newsStore[index] = updatedArticle
    return updatedArticle
  },

  // ============= USER MANAGEMENT =============

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    await delay()

    // In real app, would query Supabase users table
    // For now, return mock data
    return [
      mockAdminUser,
      {
        id: 'user-1',
        username: 'futbolero',
        avatar_url: null,
        is_admin: false,
        created_at: '2026-05-01T00:00:00Z',
      },
      {
        id: 'user-2',
        username: 'predictor_pro',
        avatar_url: null,
        is_admin: false,
        created_at: '2026-05-02T00:00:00Z',
      },
      {
        id: 'user-3',
        username: 'soccer_fan',
        avatar_url: null,
        is_admin: false,
        created_at: '2026-05-03T00:00:00Z',
      },
    ]
  },

  // Toggle admin status
  async toggleAdmin(_userId: string): Promise<User> {
    await delay()

    // In real app, would update Supabase user metadata
    // For now, just simulate
    throw new Error('Admin toggle not implemented in mock mode')
  },

  // Get user stats
  async getUserStats(): Promise<{
    total: number
    admins: number
    regular: number
    recentSignups: number
  }> {
    await delay()

    const users = await this.getAllUsers()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      total: users.length,
      admins: users.filter((u) => u.is_admin).length,
      regular: users.filter((u) => !u.is_admin).length,
      recentSignups: users.filter((u) => new Date(u.created_at) > sevenDaysAgo).length,
    }
  },

  // ============= STATS & ANALYTICS =============

  // Get dashboard stats
  async getDashboardStats(): Promise<{
    totalNews: number
    publishedNews: number
    draftNews: number
    totalUsers: number
    totalQuinielas: number
  }> {
    await delay()

    return {
      totalNews: newsStore.length,
      publishedNews: newsStore.filter((n) => n.is_published).length,
      draftNews: newsStore.filter((n) => !n.is_published).length,
      totalUsers: 4, // From mock users
      totalQuinielas: 4, // From mock quinielas
    }
  },
}
