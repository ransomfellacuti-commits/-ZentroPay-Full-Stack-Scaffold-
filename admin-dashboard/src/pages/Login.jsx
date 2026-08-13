import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'
import { TrendingUp, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // 'signin' | 'register'
  const [panel, setPanel] = useState('signin')

  /* ── Sign-in state ── */
  const [signIn, setSignIn] = useState({ email: '', password: '' })
  const [showSignPwd, setShowSignPwd] = useState(false)
  const [signError, setSignError] = useState('')
  const [signLoading, setSignLoading] = useState(false)

  /* ── Register state ── */
  const [reg, setReg] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [showRegPwd, setShowRegPwd] = useState(false)
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  /* ── Handlers ── */
  const handleSignIn = async (e) => {
    e.preventDefault()
    setSignError('')
    setSignLoading(true)
    try {
      await login(signIn.email, signIn.password)
      navigate('/')
    } catch (err) {
      setSignError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setSignLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')
    if (reg.password !== reg.confirm) {
      setRegError('Passwords do not match.')
      return
    }
    if (reg.password.length < 6) {
      setRegError('Password must be at least 6 characters.')
      return
    }
    setRegLoading(true)
    try {
      await authAPI.register({
        email: reg.email,
        password: reg.password,
        firstName: reg.firstName,
        lastName: reg.lastName,
      })
      setRegSuccess('Account created! You can now sign in.')
      setReg({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
      setTimeout(() => {
        setRegSuccess('')
        setPanel('signin')
        setSignIn({ email: reg.email, password: '' })
      }, 1800)
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <TrendingUp className="w-9 h-9 text-indigo-700" />
          </div>
          <h1 className="text-3xl font-bold text-white">ZentroPay</h1>
          <p className="text-indigo-300 mt-1">Fintech Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setPanel('signin'); setSignError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                ${panel === 'signin'
                  ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/60'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setPanel('register'); setRegError(''); setRegSuccess('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                ${panel === 'register'
                  ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/60'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          {/* ── Sign-In Panel ── */}
          {panel === 'signin' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome back</h2>

              {signError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {signError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email" required autoComplete="email"
                    value={signIn.email}
                    onChange={e => setSignIn(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showSignPwd ? 'text' : 'password'} required autoComplete="current-password"
                      value={signIn.password}
                      onChange={e => setSignIn(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowSignPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSignPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit" disabled={signLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {signLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                Don't have an account?{' '}
                <button onClick={() => setPanel('register')}
                  className="text-indigo-600 font-medium hover:underline">
                  Register here
                </button>
              </p>
            </div>
          )}

          {/* ── Register Panel ── */}
          {panel === 'register' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Create an account</h2>

              {regError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                  <span>✅</span> {regSuccess}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text" required autoComplete="given-name"
                      value={reg.firstName}
                      onChange={e => setReg(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text" required autoComplete="family-name"
                      value={reg.lastName}
                      onChange={e => setReg(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email" required autoComplete="email"
                    value={reg.email}
                    onChange={e => setReg(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPwd ? 'text' : 'password'} required autoComplete="new-password"
                      value={reg.password}
                      onChange={e => setReg(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10"
                      placeholder="Min. 6 characters"
                    />
                    <button type="button" onClick={() => setShowRegPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password" required autoComplete="new-password"
                    value={reg.confirm}
                    onChange={e => setReg(f => ({ ...f, confirm: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit" disabled={regLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {regLoading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                Already have an account?{' '}
                <button onClick={() => setPanel('signin')}
                  className="text-indigo-600 font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-indigo-400 text-xs mt-6">
          ZentroPay © {new Date().getFullYear()} — Fintech Platform
        </p>
      </div>
    </div>
  )
}
