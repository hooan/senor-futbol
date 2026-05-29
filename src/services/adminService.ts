import type { News, CreateNewsInput, UpdateNewsInput, User, NewsWithAuthor } from '@/types/database'
import { supabase } from '@/lib/supabaseClient'

// Admin Service
export const adminService = {
  // ============= NEWS MANAGEMENT =============

  // Get all news (including unpublished)
  async getAllNews(): Promise<NewsWithAuthor[]> {
    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        author:users(id, username, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as NewsWithAuthor[]
  },

  // Create news article
  async createNews(userId: string, input: CreateNewsInput): Promise<News> {
    const { data, error } = await supabase
      .from('news')
      .insert({
        title: input.title,
        content: input.content,
        excerpt: input.excerpt || null,
        author_id: userId,
        cover_image_url: input.cover_image_url || null,
        is_published: input.is_published,
        published_at: input.is_published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error
    return data as News
  },

  // Update news article
  async updateNews(input: UpdateNewsInput): Promise<News> {
    // First get the current article to check publish status
    const { data: currentArticle, error: fetchError } = await supabase
      .from('news')
      .select('is_published')
      .eq('id', input.id)
      .single()

    if (fetchError) throw fetchError

    const wasUnpublished = !currentArticle.is_published
    const nowPublished = input.is_published === true

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (input.title !== undefined) updates.title = input.title
    if (input.content !== undefined) updates.content = input.content
    if (input.excerpt !== undefined) updates.excerpt = input.excerpt
    if (input.cover_image_url !== undefined) updates.cover_image_url = input.cover_image_url
    if (input.is_published !== undefined) updates.is_published = input.is_published

    // Set published_at if publishing for the first time
    if (wasUnpublished && nowPublished) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('news')
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw error
    return data as News
  },

  // Delete news article
  async deleteNews(id: string): Promise<void> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Toggle publish status
  async togglePublish(id: string): Promise<News> {
    // Get current article
    const { data: currentArticle, error: fetchError } = await supabase
      .from('news')
      .select('is_published, published_at')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const newPublishStatus = !currentArticle.is_published
    const updates: any = {
      is_published: newPublishStatus,
      updated_at: new Date().toISOString(),
    }

    // Set published_at if publishing for the first time
    if (newPublishStatus && !currentArticle.published_at) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('news')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as News
  },

  // ============= USER MANAGEMENT =============

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as User[]
  },

  // Toggle admin status
  async toggleAdmin(userId: string): Promise<User> {
    // Get current user
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: !currentUser.is_admin })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as User
  },

  // Get user stats
  async getUserStats(): Promise<{
    total: number
    admins: number
    regular: number
    recentSignups: number
  }> {
    const { data: users, error } = await supabase
      .from('users')
      .select('is_admin, created_at')

    if (error) throw error

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
    const [newsResult, usersResult, quinielasResult] = await Promise.all([
      supabase.from('news').select('is_published', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('quinielas').select('id', { count: 'exact', head: true }),
    ])

    if (newsResult.error) throw newsResult.error
    if (usersResult.error) throw usersResult.error
    if (quinielasResult.error) throw quinielasResult.error

    // Get published vs draft counts
    const { data: allNews } = await supabase.from('news').select('is_published')
    const publishedCount = allNews?.filter((n) => n.is_published).length || 0
    const draftCount = allNews?.filter((n) => !n.is_published).length || 0

    return {
      totalNews: newsResult.count || 0,
      publishedNews: publishedCount,
      draftNews: draftCount,
      totalUsers: usersResult.count || 0,
      totalQuinielas: quinielasResult.count || 0,
    }
  },
}
