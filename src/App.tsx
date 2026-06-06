import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import ToastContainer from '@/components/ui/ToastContainer'

// Layout
import Layout from '@/components/layout/Layout'

// Auth
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'

// Pages
import Home from '@/pages/Home'
import UIPreview from '@/pages/UIPreview'
import Fixtures from '@/pages/Fixtures'
import TodayMatches from '@/pages/TodayMatches'
import MatchDetail from '@/pages/MatchDetail'
import TeamDetail from '@/pages/TeamDetail'
import Standings from '@/pages/Standings'
import News from '@/pages/News'
import NewsDetail from '@/pages/NewsDetail'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Quinielas from '@/pages/Quinielas'
import CreateQuiniela from '@/pages/CreateQuiniela'
import QuinielaDetail from '@/pages/QuinielaDetail'
import Predictions from '@/pages/Predictions'
import Leaderboard from '@/pages/Leaderboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminNews from '@/pages/admin/AdminNews'
import AdminNewsForm from '@/pages/admin/AdminNewsForm'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminTournaments from '@/pages/admin/AdminTournaments'
import AdminNewsSources from '@/pages/admin/AdminNewsSources'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminFixtures from '@/pages/admin/AdminFixtures'
import AdminRosters from '@/pages/admin/AdminRosters'

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
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
</QueryClientProvider>
</ErrorBoundary>
  )
}

export default App
