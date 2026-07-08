import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Spinner from './components/ui/Spinner'
import Login from './pages/auth/Login'
import SetupFlow from './pages/setup/SetupFlow'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/dashboard/Dashboard'
import Settings from './pages/settings/Settings'
import FeesPage from './pages/fees/FeesPage'
import StudentsPage from './pages/students/StudentsPage'
import StudentForm from './pages/students/StudentForm'
import StudentDetail from './pages/students/StudentDetail'
import ComingSoon from './pages/ComingSoon'
import WebsiteLayout from './pages/website/WebsiteLayout'
import Home from './pages/website/Home'
import About from './pages/website/About'
import Programmes from './pages/website/Programmes'
import Admissions from './pages/website/Admissions'
import Gallery from './pages/website/Gallery'
import Contact from './pages/website/Contact'

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
      {/* ── Public website ──────────────────────────────────── */}
      <Route element={<WebsiteLayout />}>
        <Route index element={<Home />} />
        <Route path="about"      element={<About />} />
        <Route path="programmes" element={<Programmes />} />
        <Route path="admissions" element={<Admissions />} />
        <Route path="gallery"    element={<Gallery />} />
        <Route path="contact"    element={<Contact />} />
      </Route>

      {/* ── Auth ────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/setup" element={<SetupFlow />} />

      {/* ── Protected app ───────────────────────────────────── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="students">
          <Route index element={<StudentsPage />} />
          <Route path="new" element={<StudentForm />} />
          <Route path=":id" element={<StudentDetail />} />
          <Route path=":id/edit" element={<StudentForm />} />
        </Route>
        <Route path="fees/*"       element={<FeesPage />} />
        <Route path="academics/*"  element={<ComingSoon title="Academic Module" />} />
        <Route path="staff/*"      element={<ComingSoon title="Staff & Payroll" />} />
        <Route path="attendance/*" element={<ComingSoon title="Attendance" />} />
        <Route path="settings"     element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
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
