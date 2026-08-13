import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  Home, Wallet, ArrowLeftRight, CreditCard, MoreHorizontal,
  Bell, ChevronRight, Settings, Shield, FileText,
  HelpCircle, LogOut, User, X, TrendingUp, Users
} from 'lucide-react'

const BOTTOM_NAV = [
  { path: '/',             icon: Home,             label: 'Home' },
  { path: '/wallet',       icon: Wallet,           label: 'Wallet' },
  { path: '/transactions', icon: ArrowLeftRight,   label: 'Transfers' },
  { path: '/cards',        icon: CreditCard,       label: 'Cards' },
  { path: '/more',         icon: MoreHorizontal,   label: 'More' },
]

/* ─── Notification drawer ─── */
const NOTIFS = [
  { id: 1, icon: '💰', title: 'Transfer Received',    body: 'You received $250.00 from Alice Johnson',    time: '2 min ago',   unread: true },
  { id: 2, icon: '✅', title: 'Payment Successful',   body: 'Bill payment of $45.00 was processed',       time: '1 hr ago',    unread: true },
  { id: 3, icon: '🔒', title: 'Security Alert',       body: 'New login detected from Chrome / macOS',     time: '3 hrs ago',   unread: false },
  { id: 4, icon: '📊', title: 'Monthly Statement',    body: 'Your May statement is ready to download',    time: 'Yesterday',   unread: false },
  { id: 5, icon: '🎉', title: 'Referral Bonus',       body: 'You earned $10 for referring a friend',      time: '2 days ago',  unread: false },
]

/* ─── Profile drawer menu items ─── */
const PROFILE_MENU = [
  { icon: User,      label: 'Personal Information', path: '/more' },
  { icon: Bell,      label: 'Notifications',        path: '/more' },
  { icon: Shield,    label: 'Security Settings',    path: '/more' },
  { icon: Settings,  label: 'Account Settings',     path: '/more' },
  { icon: FileText,  label: 'Statements',           path: '/more' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  const unreadCount = NOTIFS.filter(n => n.unread).length

  /* close drawers on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const activePath = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col h-screen bg-[#f0f4ff] overflow-hidden max-w-md mx-auto relative shadow-2xl">

      {/* ═══════════════ TOP HEADER ═══════════════ */}
      <header className="flex-shrink-0 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-10 pb-5 relative z-30">
        <div className="flex items-center justify-between">
          {/* Left — logo + greeting */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs">{greeting} 👋</p>
              <p className="text-white font-bold text-base leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
          </div>

          {/* Right — notification + avatar */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
                className="relative w-10 h-10 bg-white/15 backdrop-blur hover:bg-white/25 rounded-xl flex items-center justify-center transition-all"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-400 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {NOTIFS.map(n => (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${n.unread ? 'bg-indigo-50/40' : ''}`}>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0">
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                            {n.unread && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{n.body}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                    <button className="text-xs text-indigo-600 font-medium hover:underline">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile avatar */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur hover:bg-white/30 flex items-center justify-center text-white font-bold text-sm uppercase transition-all border-2 border-white/30"
              >
                {initials}
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  {/* Profile header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-lg uppercase border-2 border-white/40">
                        {initials}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user?.first_name} {user?.last_name}</p>
                        <p className="text-white/70 text-xs">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-white/90 text-[10px] capitalize">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Menu items */}
                  <div className="py-1">
                    {PROFILE_MENU.map(({ icon: Icon, label, path }) => (
                      <button key={label} onClick={() => { navigate(path); setProfileOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium flex-1">{label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    ))}
                    {user?.role === 'admin' && (
                      <button onClick={() => { navigate('/admin/users'); setProfileOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors text-left">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-purple-700 font-medium flex-1">Admin — Users</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </button>
                    )}
                  </div>
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════ PAGE CONTENT ═══════════════ */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        {children}
      </main>

      {/* ═══════════════ FIXED BOTTOM NAV ═══════════════ */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-3 pb-3">
        <div className="bg-white/90 backdrop-blur-xl rounded-[26px] shadow-[0_-4px_40px_rgba(99,102,241,0.18)] border border-white/60 flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV.map(({ path, icon: Icon, label }) => {
            const active = activePath(path)
            return (
              <Link key={path} to={path}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 group relative min-w-[52px]"
              >
                {/* Active pill background */}
                {active && (
                  <span className="absolute inset-0 bg-indigo-600 rounded-2xl" />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-all duration-200
                    ${active ? 'text-white scale-110' : 'text-gray-400 group-hover:text-indigo-500'}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className={`text-[10px] font-semibold relative z-10 transition-all duration-200
                    ${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'}`}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
