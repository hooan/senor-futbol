import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNewsSources, useNewsFetchLogs, useUpdateNewsSource, useTriggerNewsFetch } from '@/hooks/useNewsSources'
import { format } from 'date-fns'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/contexts/ToastContext'

export default function AdminNewsSources() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [expandedSource, setExpandedSource] = useState<string | null>(null)

  const { data: sources, isLoading: sourcesLoading } = useNewsSources()
  const { data: logs, isLoading: logsLoading } = useNewsFetchLogs(20)
  const updateSource = useUpdateNewsSource()
  const triggerFetch = useTriggerNewsFetch()

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await updateSource.mutateAsync({
        id,
        updates: { is_active: !currentState },
      })
      showToast(
        `Source ${!currentState ? 'enabled' : 'disabled'} successfully`,
        'success'
      )
    } catch (error) {
      showToast(`Error: ${(error as Error).message}`, 'error')
    }
  }

  const handleManualFetch = async () => {
    try {
      showToast('Starting news fetch...', 'info')
      const result = await triggerFetch.mutateAsync()
      
      if (result.success) {
        const summary = result.results
          .map((r: any) => `${r.source}: ${r.status} (${r.articlesSaved || 0} saved)`)
          .join(', ')
        showToast(`News fetch completed: ${summary}`, 'success')
      } else {
        showToast(`Error: ${result.error}`, 'error')
      }
    } catch (error) {
      showToast(`Failed to fetch news: ${(error as Error).message}`, 'error')
    }
  }

  if (sourcesLoading || logsLoading) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <Loading size="large" text="Loading news sources..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={() => navigate('/admin')} size="small" className="mb-6">
            ← BACK TO ADMIN
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-headline text-5xl uppercase mb-2">NEWS SOURCES</h1>
              <p className="font-body text-gray-600">
                Manage automated news fetching from NewsAPI and GNews
              </p>
            </div>

            <Button
              onClick={handleManualFetch}
              disabled={triggerFetch.isPending}
              size="large"
            >
              {triggerFetch.isPending ? 'FETCHING...' : 'FETCH NEWS NOW'}
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Active Sources */}
        <Card variant="elevated" className="mb-8">
          <h2 className="font-headline text-2xl uppercase mb-6">CONFIGURED SOURCES</h2>

          <div className="space-y-4">
            {sources?.map((source) => {
              const isExpanded = expandedSource === source.id
              const rateLimitPercent = (source.requests_today / source.requests_per_day) * 100

              return (
                <div
                  key={source.id}
                  className="border-thin border-gray-300 hover:border-raw-black transition-colors"
                >
                  {/* Source Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-headline text-xl uppercase">{source.name}</h3>
                          {source.is_active ? (
                            <Badge variant="success">ACTIVE</Badge>
                          ) : (
                            <Badge variant="default">DISABLED</Badge>
                          )}
                          <Badge variant="default">{source.source_type.toUpperCase()}</Badge>
                        </div>

                        <p className="font-mono text-xs text-gray-600 mb-3">
                          {source.search_query}
                        </p>

                        {/* Rate Limit Bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs font-mono text-gray-600 mb-1">
                              <span>Rate Limit</span>
                              <span>
                                {source.requests_today} / {source.requests_per_day}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 border-thin border-gray-400">
                              <div
                                className={`h-full transition-all ${
                                  rateLimitPercent >= 90
                                    ? 'bg-red-500'
                                    : rateLimitPercent >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${rateLimitPercent}%` }}
                              />
                            </div>
                          </div>
                          <span className="font-mono text-xs text-gray-600 min-w-[80px]">
                            {source.last_request_date
                              ? format(new Date(source.last_request_date), 'MMM d, yyyy')
                              : 'Never'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => setExpandedSource(isExpanded ? null : source.id)}
                        >
                          {isExpanded ? 'HIDE' : 'DETAILS'}
                        </Button>
                        <Button
                          size="small"
                          variant={source.is_active ? 'destructive' : 'primary'}
                          onClick={() => handleToggleActive(source.id, source.is_active)}
                          disabled={updateSource.isPending}
                        >
                          {source.is_active ? 'DISABLE' : 'ENABLE'}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t-thin border-gray-300">
                        <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
                          <div>
                            <p className="text-gray-600 text-xs mb-1">API ENDPOINT</p>
                            <p className="break-all">{source.api_endpoint}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs mb-1">API KEY ENV</p>
                            <p>{source.api_key_env}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-gray-600 text-xs mb-1">CONFIGURATION</p>
                            <pre className="bg-gray-100 p-2 border-thin border-gray-300 overflow-x-auto text-xs">
                              {JSON.stringify(source.config, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Fetch History */}
        <Card variant="elevated">
          <h2 className="font-headline text-2xl uppercase mb-6">FETCH HISTORY</h2>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead className="border-b-thick border-raw-black">
                <tr className="text-left">
                  <th className="pb-3 pr-4">DATE</th>
                  <th className="pb-3 pr-4">SOURCE</th>
                  <th className="pb-3 pr-4">STATUS</th>
                  <th className="pb-3 pr-4 text-right">FETCHED</th>
                  <th className="pb-3 pr-4 text-right">SAVED</th>
                  <th className="pb-3">ERROR</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <tr key={log.id} className="border-b-thin border-gray-300">
                    <td className="py-3 pr-4 text-xs">
                      {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="py-3 pr-4">{log.source.name}</td>
                    <td className="py-3 pr-4">
                      {log.status === 'success' && (
                        <Badge variant="success">SUCCESS</Badge>
                      )}
                      {log.status === 'error' && <Badge variant="error">ERROR</Badge>}
                      {log.status === 'rate_limited' && (
                        <Badge variant="warning">RATE LIMITED</Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">{log.articles_fetched}</td>
                    <td className="py-3 pr-4 text-right">{log.articles_saved}</td>
                    <td className="py-3 text-xs text-gray-600">
                      {log.error_message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs && logs.length === 0 && (
              <p className="text-center py-8 text-gray-600">No fetch history yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
