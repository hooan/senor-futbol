import { Link } from 'react-router-dom'
import { useAdminUsers, useUserStats } from '@/hooks/useAdmin'
import { format } from 'date-fns'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function AdminUsers() {
  const { data: users, isLoading: loadingUsers } = useAdminUsers()
  const { data: stats, isLoading: loadingStats } = useUserStats()

  if (loadingUsers || loadingStats) {
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
              <h1 className="font-headline text-4xl uppercase mb-2">USER MANAGEMENT</h1>
              <p className="text-gray-300">{users?.length || 0} registered users</p>
            </div>
            <Link to="/admin">
              <Button variant="secondary" size="small">
                ← DASHBOARD
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-headline mb-1">{stats?.total || 0}</div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Total Users</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-headline text-purple-600 mb-1">
                {stats?.admins || 0}
              </div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Administrators</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-headline text-blue-600 mb-1">
                {stats?.regular || 0}
              </div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Regular Users</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-headline text-green-600 mb-1">
                {stats?.recentSignups || 0}
              </div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Last 7 Days</div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl uppercase">ALL USERS</h2>
          </div>

          {!users || users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-thick border-gray-900">
                    <th className="text-left py-3 px-4 uppercase text-xs font-semibold">User</th>
                    <th className="text-left py-3 px-4 uppercase text-xs font-semibold">Role</th>
                    <th className="text-left py-3 px-4 uppercase text-xs font-semibold">
                      Joined
                    </th>
                    <th className="text-right py-3 px-4 uppercase text-xs font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b-3 border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-900 text-white font-headline text-lg flex items-center justify-center border-3 border-gray-900">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold font-mono">@{user.username}</div>
                            <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={user.is_admin ? 'error' : 'default'}>
                          {user.is_admin ? 'ADMIN' : 'USER'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(user.created_at), 'h:mm a')}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button size="small" variant="secondary" disabled>
                          VIEW DETAILS
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border-thick border-blue-600 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">User Management</h3>
              <p className="text-blue-800 text-sm mb-3">
                This panel shows registered users from your Supabase database. In mock mode,
                you're viewing sample data.
              </p>
              <div className="space-y-2 text-sm text-blue-900">
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Admins</strong> have full access to the admin panel and can manage
                    content
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Regular users</strong> can create quinielas, make predictions, and
                    participate
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Production:</strong> Connect to Supabase to see real user data and
                    enable role management
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 bg-gray-100 border-thick border-gray-400 p-6">
          <h3 className="font-headline text-lg uppercase mb-4 text-gray-700">
            COMING SOON FEATURES
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span>⏳</span>
              <span>View user activity and statistics</span>
            </div>
            <div className="flex items-start gap-2">
              <span>⏳</span>
              <span>Toggle admin privileges</span>
            </div>
            <div className="flex items-start gap-2">
              <span>⏳</span>
              <span>View user's quinielas and predictions</span>
            </div>
            <div className="flex items-start gap-2">
              <span>⏳</span>
              <span>Send notifications to users</span>
            </div>
            <div className="flex items-start gap-2">
              <span>⏳</span>
              <span>Export user data</span>
            </div>
            <div className="flex items-start gap-2">
              <span>⏳</span>
              <span>User search and filtering</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
