import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, CreditCard, Wallet, LogOut,
  Menu, X, Bell, ChevronDown, TrendingUp, Shield
} from 'lucide-react'

const nav = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users',        icon: Users,           label: 'Users' },
  { path: '/transactions', icon: CreditCard,      label: 'Transactions' },
  { path: '/wallets',      icon: Wallet,          label: 'Wallets' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-20`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <div className={`flex items-center gap-2 overflow-hidden ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-indigo-700" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg whitespace-nowrap">ZentroPay</span>}
          </div>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="text-indigo-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {nav.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1 transition-all
                  ${active ? 'bg-white text-indigo-700 font-semibold shadow' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}
                  ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-indigo-700">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold uppercase">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-indigo-300 truncate">{user?.role}</p>
              </div>
              <button onClick={handleLogout} title="Logout" className="text-indigo-300 hover:text-red-300">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="w-full flex justify-center text-indigo-300 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="font-medium text-indigo-600">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <span className="hidden md:block font-medium text-gray-700">{user?.first_name} {user?.last_name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
