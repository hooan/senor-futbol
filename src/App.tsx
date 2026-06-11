import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import ToastContainer from '@/components/ui/ToastContainer'
import Loading from '@/components/ui/Loading'

// Layout
import Layout from '@/components/layout/Layout'

// Auth
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'

// Pages — lazy loaded for code splitting
const Home = lazy(() => import('@/pages/Home'))
const UIPreview = lazy(() => import('@/pages/UIPreview'))
const Fixtures = lazy(() => import('@/pages/Fixtures'))
const TodayMatches = lazy(() => import('@/pages/TodayMatches'))
const MatchDetail = lazy(() => import('@/pages/MatchDetail'))
const TeamDetail = lazy(() => import('@/pages/TeamDetail'))
const Standings = lazy(() => import('@/pages/Standings'))
const News = lazy(() => import('@/pages/News'))
const NewsDetail = lazy(() => import('@/pages/NewsDetail'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Profile = lazy(() => import('@/pages/Profile'))
const Quinielas = lazy(() => import('@/pages/Quinielas'))
const CreateQuiniela = lazy(() => import('@/pages/CreateQuiniela'))
const QuinielaDetail = lazy(() => import('@/pages/QuinielaDetail'))
const Predictions = lazy(() => import('@/pages/Predictions'))
const Leaderboard = lazy(() => import('@/pages/Leaderboard'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminNews = lazy(() => import('@/pages/admin/AdminNews'))
const AdminNewsForm = lazy(() => import('@/pages/admin/AdminNewsForm'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminTournaments = lazy(() => import('@/pages/admin/AdminTournaments'))
const AdminNewsSources = lazy(() => import('@/pages/admin/AdminNewsSources'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminFixtures = lazy(() => import('@/pages/admin/AdminFixtures'))
const AdminRosters = lazy(() => import('@/pages/admin/AdminRosters'))

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <ToastContainer />
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <Loading />
                </div>
              }>
              <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
            
            {/* News Routes */}
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            
            {/* Fixtures Routes */}
            <Route path="fixtures" element={<Fixtures />} />
            <Route path="fixtures/:id" element={<MatchDetail />} />
            <Route path="fixtures/today" element={<TodayMatches />} />
            <Route path="fixtures/results" element={<Navigate to="/fixtures" replace />} />
            
            {/* Teams Route */}
            <Route path="teams/:id" element={<TeamDetail />} />
            
            {/* Standings Route */}
            <Route path="standings" element={<Standings />} />
            
            {/* Quinielas Routes */}
            <Route path="quinielas" element={<Quinielas />} />
            <Route path="quinielas/create" element={
              <ProtectedRoute>
                <CreateQuiniela />
              </ProtectedRoute>
            } />
            <Route path="quinielas/:shareCode" element={<QuinielaDetail />} />
            <Route path="quinielas/:id/predictions" element={<Predictions />} />
            <Route path="quinielas/:id/leaderboard" element={<Leaderboard />} />
            
            {/* Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="admin/news" element={
              <AdminRoute>
                <AdminNews />
              </AdminRoute>
            } />
            <Route path="admin/news/create" element={
              <AdminRoute>
                <AdminNewsForm />
              </AdminRoute>
            } />
            <Route path="admin/news/edit/:id" element={
              <AdminRoute>
                <AdminNewsForm />
              </AdminRoute>
            } />
            <Route path="admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="admin/tournaments" element={
              <AdminRoute>
                <AdminTournaments />
              </AdminRoute>
            } />
            <Route path="admin/news-sources" element={
              <AdminRoute>
                <AdminNewsSources />
              </AdminRoute>
            } />
            <Route path="admin/settings" element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            } />
            <Route path="admin/fixtures" element={
              <AdminRoute>
                <AdminFixtures />
              </AdminRoute>
            } />
            <Route path="admin/rosters" element={
              <AdminRoute>
                <AdminRosters />
              </AdminRoute>
            } />
            
            {/* UI Preview (Development) */}
            <Route path="ui-preview" element={<UIPreview />} />
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
</QueryClientProvider>
</ErrorBoundary>
  )
}

export default App
