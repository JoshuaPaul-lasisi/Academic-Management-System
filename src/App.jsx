import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Spinner from './components/ui/Spinner'
import Login from './pages/auth/Login'
import SetupFlow from './pages/setup/SetupFlow'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/dashboard/Dashboard'
import Settings from './pages/settings/Settings'
import ComingSoon from './pages/ComingSoon'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, profile, schoolSetup, loading } = useAuth()

  if (loading) return <FullScreenSpinner />

  // Redirect director to setup if school not configured
  if (user && profile?.role === 'director' && schoolSetup === false) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupFlow />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="students/*" element={<ComingSoon title="Student Records" />} />
        <Route path="fees/*"     element={<ComingSoon title="Fee Management" />} />
        <Route path="academics/*" element={<ComingSoon title="Academic Module" />} />
        <Route path="staff/*"    element={<ComingSoon title="Staff & Payroll" />} />
        <Route path="attendance/*" element={<ComingSoon title="Attendance" />} />
        <Route path="settings"   element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
