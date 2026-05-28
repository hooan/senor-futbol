import { Link } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useAdmin'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Button from '@/components/ui/Button'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

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
              <h1 className="font-headline text-4xl uppercase mb-2">ADMIN DASHBOARD</h1>
              <p className="text-gray-300">Manage content, users, and monitor activity</p>
            </div>
            <Link to="/">
              <Button variant="secondary" size="small">
                ← BACK TO SITE
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* News Stats */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                  Total Articles
                </div>
                <div className="text-4xl font-headline">{stats?.totalNews || 0}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 border-thick border-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm pt-4 border-t-3 border-gray-200">
              <div>
                <span className="font-semibold text-green-600">{stats?.publishedNews || 0}</span>{' '}
                Published
              </div>
              <div>
                <span className="font-semibold text-yellow-600">{stats?.draftNews || 0}</span> Drafts
              </div>
            </div>
          </Card>

          {/* Users Stats */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                  Total Users
                </div>
                <div className="text-4xl font-headline">{stats?.totalUsers || 0}</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 border-thick border-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <div className="text-sm pt-4 border-t-3 border-gray-200">
              <span className="text-gray-600">Registered accounts</span>
            </div>
          </Card>

          {/* Quinielas Stats */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                  Total Quinielas
                </div>
                <div className="text-4xl font-headline">{stats?.totalQuinielas || 0}</div>
              </div>
              <div className="w-12 h-12 bg-green-100 border-thick border-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm pt-4 border-t-3 border-gray-200">
              <span className="text-gray-600">Active prediction pools</span>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-12">
          <h2 className="font-headline text-2xl uppercase mb-6">QUICK ACTIONS</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link to="/admin/news">
              <button className="w-full p-6 border-thick border-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center border-thick border-blue-700 group-hover:bg-white group-hover:text-blue-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg uppercase">Manage News</div>
                    <div className="text-sm text-gray-600 group-hover:text-gray-300">
                      Create, edit, delete articles
                    </div>
                  </div>
                </div>
              </button>
            </Link>

            <Link to="/admin/users">
              <button className="w-full p-6 border-thick border-gray-900 hover:bg-gray-900 hover:text-white transition-colors text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 text-white flex items-center justify-center border-thick border-purple-700 group-hover:bg-white group-hover:text-purple-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg uppercase">Manage Users</div>
                    <div className="text-sm text-gray-600 group-hover:text-gray-300">
                      View and manage user accounts
                    </div>
                  </div>
                </div>
              </button>
            </Link>

            <button className="w-full p-6 border-thick border-gray-300 bg-gray-100 text-left cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-400 text-white flex items-center justify-center border-thick border-gray-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg uppercase text-gray-500">
                    Analytics
                  </div>
                  <div className="text-sm text-gray-500">Coming soon</div>
                </div>
              </div>
            </button>
          </div>
        </Card>

        {/* Info Banner */}
        <div className="bg-blue-50 border-thick border-blue-600 p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Admin Access</h3>
              <p className="text-blue-800 text-sm">
                You're currently using mock data. In production, this panel will connect to your
                Supabase database for real-time management of news, users, and quinielas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
