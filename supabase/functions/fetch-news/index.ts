// Supabase Edge Function: fetch-news
// Fetches news from multiple sources (NewsAPI, GNews) and stores in news table
// Respects rate limits (100 req/day per source on free tier)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsSource {
  id: string
  name: string
  source_type: 'newsapi' | 'gnews'
  api_endpoint: string
  api_key_env: string
  requests_per_day: number
  requests_today: number
  last_request_date: string | null
  search_query: string
  is_active: boolean
  language: string
  config: Record<string, any>
}

interface NewsArticle {
  title: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string
  is_published: boolean
  language: string
  source_name?: string
  source_url?: string | null
}

// Transform NewsAPI article to our schema
function transformNewsAPIArticle(article: any, language: string): NewsArticle | null {
  if (!article.title || article.title === '[Removed]') return null
  // Generate excerpt from description or content
  const excerpt = article.description?.substring(0, 200) || 
                  article.content?.substring(0, 200) || 
                  null

  return {
    title: article.title,
    content: article.content || article.description || '',
    excerpt: excerpt,
    cover_image_url: article.urlToImage || null,
    published_at: article.publishedAt,
    is_published: true,
    language: language,
  }
}

// Transform GNews article to our schema
function transformGNewsArticle(article: any, language: string, sourceName: string): NewsArticle | null {
  if (!article.title) return null

  return {
    title: article.title,
    content: article.content || article.description || '',
    excerpt: article.description?.substring(0, 200) || null,
    cover_image_url: article.image || null,
    published_at: article.publishedAt,
    is_published: true,
    language: language,
    source_name: sourceName,
    source_url: article.url || null,
  }
}

// Fetch from NewsAPI
async function fetchFromNewsAPI(source: NewsSource, apiKey: string): Promise<NewsArticle[]> {
  const config = source.config || {}
  const params = new URLSearchParams({
    q: source.search_query,
    apiKey: apiKey,
    language: config.language || 'en',
    sortBy: config.sortBy || 'publishedAt',
    pageSize: String(config.pageSize || 20),
  })

  console.log(`Fetching from NewsAPI: ${source.api_endpoint}?${params}`)
  const response = await fetch(`${source.api_endpoint}?${params}`)
  
  if (!response.ok) {
    throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (data.status !== 'ok') {
    throw new Error(`NewsAPI error: ${data.message}`)
  }
  
  return data.articles
    .map((article: any) => transformNewsAPIArticle(article, source.language, source.name))
    .filter((article: NewsArticle | null): article is NewsArticle => article !== null)
}

// Fetch from GNews
async function fetchFromGNews(source: NewsSource, apiKey: string): Promise<NewsArticle[]> {
  const config = source.config || {}
  const params = new URLSearchParams({
    q: source.search_query,
    apikey: apiKey,
    lang: config.lang || 'en',
    max: String(config.max || 10),
    sortby: config.sortby || 'publishedAt',
  })

  const response = await fetch(`${source.api_endpoint}?${params}`)
  
  if (!response.ok) {
    throw new Error(`GNews error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return data.articles
    .map((article: any) => transformGNewsArticle(article, source.language, source.name))
    .filter((article: NewsArticle | null): article is NewsArticle => article !== null)
}

// Check and update rate limit
async function checkRateLimit(supabase: any, source: NewsSource): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  
  // Reset counter if it's a new day
  if (source.last_request_date !== today) {
    await supabase
      .from('news_sources')
      .update({
        requests_today: 0,
        last_request_date: today,
      })
      .eq('id', source.id)
    
    return true
  }

  // Check if we've exceeded the limit
  if (source.requests_today >= source.requests_per_day) {
    console.log(`Rate limit reached for ${source.name}: ${source.requests_today}/${source.requests_per_day}`)
    return false
  }

  return true
}

// Increment request counter
async function incrementRequestCounter(supabase: any, sourceId: string) {
  await supabase
    .from('news_sources')
    .update({
      requests_today: supabase.rpc('increment_requests_today'),
    })
    .eq('id', sourceId)
}

// Save articles to database
async function saveArticles(supabase: any, articles: NewsArticle[]): Promise<number> {
  if (articles.length === 0) return 0

  // Insert articles, skip duplicates based on title
  const { data, error } = await supabase
    .from('news')
    .upsert(
      articles.map(article => ({
        ...article,
        author_id: null, // Auto-fetched articles have no author
      })),
      {
        onConflict: 'title',
        ignoreDuplicates: true,
      }
    )
    .select()

  if (error) {
    console.error('Error saving articles:', error)
    return 0
  }

  return data?.length || 0
}

// Log fetch operation
async function logFetchOperation(
  supabase: any,
  sourceId: string,
  articlesFetched: number,
  articlesSaved: number,
  status: 'success' | 'error' | 'rate_limited',
  errorMessage?: string
) {
  await supabase.from('news_fetch_log').insert({
    source_id: sourceId,
    articles_fetched: articlesFetched,
    articles_saved: articlesSaved,
    status,
    error_message: errorMessage || null,
  })
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get active news sources
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true)

    if (sourcesError) throw sourcesError

    const results = []

    // Process each source
    for (const source of sources as NewsSource[]) {
      console.log(`Processing source: ${source.name}`)
      console.log(`Current requests today: ${source.requests_today}/${source.requests_per_day}`)
      try {
        // Check rate limit
        const canProceed = await checkRateLimit(supabase, source)
        if (!canProceed) {
          await logFetchOperation(supabase, source.id, 0, 0, 'rate_limited')
          results.push({
            source: source.name,
            status: 'rate_limited',
            message: `Rate limit reached (${source.requests_today}/${source.requests_per_day})`,
          })
          continue
        }

        // Get API key from environment
        const apiKey = Deno.env.get(source.api_key_env)
        if (!apiKey) {
          throw new Error(`API key not found: ${source.api_key_env}`)
        }

        // Fetch articles based on source type
        let articles: NewsArticle[] = []
        
        if (source.source_type === 'newsapi') {
          articles = await fetchFromNewsAPI(source, apiKey)
        } else if (source.source_type === 'gnews') {
          articles = await fetchFromGNews(source, apiKey)
        }
        console.log(`Fetched ${articles} articles from ${source.name}`)
         // Increment request counter
        await incrementRequestCounter(supabase, source.id)

        // Save articles to database
        const savedCount = await saveArticles(supabase, articles)

        // Log success
        await logFetchOperation(
          supabase,
          source.id,
          articles.length,
          savedCount,
          'success'
        )

        results.push({
          source: source.name,
          status: 'success',
          articlesFetched: articles.length,
          articlesSaved: savedCount,
        })

        console.log(`${source.name}: Fetched ${articles.length}, Saved ${savedCount}`)
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error)
        
        await logFetchOperation(
          supabase,
          source.id,
          0,
          0,
          'error',
          error.message
        )

        results.push({
          source: source.name,
          status: 'error',
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
