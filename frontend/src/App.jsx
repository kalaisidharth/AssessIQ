import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/user/UserDashboard'
import UserAssessments from './pages/user/UserAssessments'
import TakeAssessment from './pages/user/TakeAssessment'
import UserResults from './pages/user/UserResults'
import ResultDetail from './pages/user/ResultDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAssessments from './pages/admin/AdminAssessments'
import CreateAssessment from './pages/admin/CreateAssessment'
import AdminResults from './pages/admin/AdminResults'
import AdminUserDetail from './pages/admin/AdminUserDetail'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-obsidian-950 flex items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
      <p className="font-mono text-volt-400 text-sm tracking-widest">LOADING...</p>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/assessments" element={<ProtectedRoute role="user"><UserAssessments /></ProtectedRoute>} />
      <Route path="/assessments/:id/take" element={<ProtectedRoute role="user"><TakeAssessment /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute role="user"><UserResults /></ProtectedRoute>} />
      <Route path="/results/:id" element={<ProtectedRoute role="user"><ResultDetail /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/users/:id" element={<ProtectedRoute role="admin"><AdminUserDetail /></ProtectedRoute>} />
      <Route path="/admin/assessments" element={<ProtectedRoute role="admin"><AdminAssessments /></ProtectedRoute>} />
      <Route path="/admin/assessments/create" element={<ProtectedRoute role="admin"><CreateAssessment /></ProtectedRoute>} />
      <Route path="/admin/results" element={<ProtectedRoute role="admin"><AdminResults /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="bg-gradient-animated min-h-screen scanlines">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111120',
                color: '#e8e8f0',
                border: '1px solid rgba(180,255,57,0.2)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#b4ff39', secondary: '#050508' } },
              error: { iconTheme: { primary: '#ff6b6b', secondary: '#050508' } },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
