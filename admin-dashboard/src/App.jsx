import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WalletPage from './pages/Wallets'
import Transactions from './pages/Transactions'
import Cards from './pages/Cards'
import More from './pages/More'
import AdminUsers from './pages/AdminUsers'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading ZentroPay…</p>
      </div>
    </div>
  )
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/"              element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/wallet"        element={<PrivateRoute><WalletPage /></PrivateRoute>} />
          <Route path="/transactions"  element={<PrivateRoute><Transactions /></PrivateRoute>} />
          <Route path="/cards"         element={<PrivateRoute><Cards /></PrivateRoute>} />
          <Route path="/more"          element={<PrivateRoute><More /></PrivateRoute>} />
          <Route path="/admin/users"   element={<PrivateRoute><AdminRoute><AdminUsers /></AdminRoute></PrivateRoute>} />
          {/* legacy aliases */}
          <Route path="/wallets"       element={<Navigate to="/wallet" replace />} />
          <Route path="/users"         element={<Navigate to="/admin/users" replace />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
