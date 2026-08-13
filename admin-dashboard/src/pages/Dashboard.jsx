import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionsAPI, walletsAPI, usersAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import {
  Send, Receipt, UserPlus, FileText,
  ArrowUpRight, ArrowDownLeft, TrendingUp,
  ChevronRight, Eye, EyeOff, RefreshCw,
  Zap, ShieldCheck, Star, Globe, Copy, Check,
  Wifi
} from 'lucide-react'
import InterbankTransferModal from '../components/InterbankTransferModal'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'

/* ── Polling interval: 15 seconds ─────────────────────────────────────── */
const POLL_INTERVAL = 15_000

const fmt   = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n ?? 0)
const fmtSh = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0)

const QUICK_ACTIONS = [
  { label: 'Send Money',       icon: Send,     color: 'bg-indigo-100 text-indigo-600', path: '/transactions' },
  { label: 'Pay Bills',        icon: Receipt,  color: 'bg-violet-100 text-violet-600', path: '/transactions' },
  { label: 'Add Beneficiary',  icon: UserPlus, color: 'bg-sky-100    text-sky-600',    path: '/wallet' },
  { label: 'Statement',        icon: FileText, color: 'bg-emerald-100 text-emerald-600', path: '/more' },
]
const INSIGHTS = [
  { icon: Zap,        color: 'bg-amber-50  text-amber-500',   title: 'Spending Tip',      body: 'You spent 12% less than last month. Keep it up!' },
  { icon: ShieldCheck,color: 'bg-green-50  text-green-500',   title: 'Account Secure',    body: 'Two-factor authentication is active on your account.' },
  { icon: Star,       color: 'bg-indigo-50 text-indigo-500',  title: 'Loyalty Points',    body: 'You have 1,240 reward points — redeem for cashback.' },
]

/* Custom tooltip for chart */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-bold text-indigo-600">{fmtSh(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [wallet,  setWallet]  = useState(null)
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [hideBalance, setHideBalance] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const [showInterbank, setShowInterbank] = useState(false)
  const [liveUpdate, setLiveUpdate] = useState(false) // flashes on poll
  const pollRef = useRef(null)

  /* ── Silent balance refresh (no loading spinner) ─────────────────────── */
  const refreshBalance = useCallback(async (silent = false) => {
    try {
      const [wRes, sRes] = await Promise.all([
        walletsAPI.getBalance(),
        transactionsAPI.getStats(),
      ])
      setWallet(wRes.data.wallet)
      setStats(sRes.data.stats)
      if (silent) {
        setLiveUpdate(true)
        setTimeout(() => setLiveUpdate(false), 800)
      }
    } catch { /* silent */ }
  }, [])

  /* ── Full initial load ───────────────────────────────────────────────── */
  const load = async () => {
    setLoading(true)
    try {
      const [wRes, sRes, uRes] = await Promise.all([
        walletsAPI.getBalance(),
        transactionsAPI.getStats(),
        usersAPI.getProfile(),
      ])
      setWallet(wRes.data.wallet)
      setStats(sRes.data.stats)
      setAccountNumber(uRes.data?.user?.account_number || '')
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  /* ── Mount: initial load + start polling ────────────────────────────── */
  useEffect(() => {
    load()
    pollRef.current = setInterval(() => refreshBalance(true), POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [])

  const handleCopyAcct = () => {
    navigator.clipboard?.writeText(accountNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* Derive spending data */
  const chartData = stats?.monthlyVolume?.slice(-6) ?? []
  const recentTx  = stats?.recentTransactions ?? []

  /* income vs spend from real totals */
  const income = wallet?.balance ?? 0
  const spent  = stats?.transactions?.volume ?? 0

  /* Derive display name */
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Account Holder'
    : 'Account Holder'

  return (
    <div className="space-y-0">

      {/* ── BALANCE HERO (bleeds under header) ── */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-2 pb-8">

        {/* Customer name row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-white/60 text-xs font-medium tracking-wide uppercase">Welcome back</p>
            <p className="text-white font-bold text-lg leading-tight">{displayName}</p>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-colors ${liveUpdate ? 'bg-green-400 animate-ping' : 'bg-white/30'}`} />
            <span className="text-white/40 text-[10px] font-medium">LIVE</span>
          </div>
        </div>

        <p className="text-white/50 text-xs mb-1">{wallet?.currency ?? 'USD'} Available Balance</p>
        <div className="flex items-end gap-3">
          <h2 className={`text-4xl font-extrabold text-white tracking-tight transition-all duration-500 ${liveUpdate ? 'scale-105' : 'scale-100'}`}>
            {hideBalance ? '••••••' : loading ? '...' : fmt(wallet?.balance)}
          </h2>
          <button onClick={() => setHideBalance(v => !v)} className="mb-1 text-white/50 hover:text-white transition-colors">
            {hideBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Account number row */}
        {accountNumber && (
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-white/50 text-xs font-mono tracking-widest">
              Acc: {hideBalance ? '••••••••••' : accountNumber}
            </p>
            <button onClick={handleCopyAcct}
              className="text-white/40 hover:text-white transition-colors">
              {copied ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Mini income / spend summary */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/15 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400/30 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-green-300" />
            </div>
            <div>
              <p className="text-white/60 text-[10px]">Total Received</p>
              <p className="text-white font-bold text-sm">{hideBalance ? '••••' : fmtSh(income)}</p>
            </div>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-400/30 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-red-300" />
            </div>
            <div>
              <p className="text-white/60 text-[10px]">Total Spent</p>
              <p className="text-white font-bold text-sm">{hideBalance ? '••••' : fmtSh(spent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── White card content area ── */}
      <div className="bg-[#f0f4ff] space-y-4 px-4 pt-5">

        {/* QUICK ACTIONS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ label, icon: Icon, color, path }) => (
              <button key={label} onClick={() => navigate(path)}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 shadow-sm hover:shadow-md active:scale-95 transition-all">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight px-1">{label}</span>
              </button>
            ))}
          </div>

          {/* Interbank Transfer Banner */}
          <button onClick={() => setShowInterbank(true)}
            className="mt-3 w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm hover:opacity-90 active:scale-95 transition-all">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">Transfer to Other Bank</p>
              <p className="text-white/70 text-[10px]">500+ banks · 140+ countries · Instant</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/70 flex-shrink-0" />
          </button>
        </section>

        {/* SPENDING ANALYTICS */}
        <section className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Spending Analytics</h3>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
            <button onClick={load} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#balGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
              {loading ? <RefreshCw className="w-6 h-6 animate-spin text-indigo-300" /> : 'No data yet'}
            </div>
          )}
          {/* Summary pills */}
          {!loading && stats && (
            <div className="flex gap-2 mt-3">
              <div className="flex-1 bg-indigo-50 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-indigo-400 font-medium">Transactions</p>
                <p className="text-indigo-700 font-bold text-sm">{stats.transactions.total}</p>
              </div>
              <div className="flex-1 bg-green-50 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-green-500 font-medium">Today</p>
                <p className="text-green-700 font-bold text-sm">{stats.transactions.today}</p>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-amber-500 font-medium">Pending</p>
                <p className="text-amber-700 font-bold text-sm">{stats.transactions.pending}</p>
              </div>
            </div>
          )}
        </section>

        {/* ACCOUNT SUMMARY CARDS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">Account Summary</h3>
            <button onClick={() => navigate('/wallet')} className="text-xs text-indigo-600 font-semibold">View all</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Main Wallet',    val: wallet?.balance,                 icon: '💳', grad: 'from-indigo-500 to-violet-500' },
              { label: 'Total Volume',   val: stats?.transactions?.volume,     icon: '📊', grad: 'from-sky-500    to-blue-600'   },
              { label: 'Active Users',   val: stats?.users?.active,            icon: '👥', grad: 'from-emerald-500 to-teal-500' },
              { label: 'Total Wallets',  val: stats?.wallet?.totalBalance,     icon: '🏦', grad: 'from-orange-400 to-amber-500' },
            ].map(({ label, val, icon, grad }) => (
              <div key={label} className={`bg-gradient-to-br ${grad} rounded-2xl p-4 shadow-sm`}>
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-white/70 text-[10px] font-medium">{label}</p>
                <p className="text-white font-extrabold text-base mt-0.5">
                  {loading ? '…' :
                    typeof val === 'number' && val > 999
                      ? fmtSh(val)
                      : val ?? 0}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* RECENT TRANSACTIONS */}
        <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Recent Transactions</h3>
            <button onClick={() => navigate('/transactions')}
              className="flex items-center gap-0.5 text-xs text-indigo-600 font-semibold hover:underline">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="py-10 flex justify-center">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : recentTx.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No transactions yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTx.slice(0, 5).map((tx) => {
                const isCredit = tx.amount > 0
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                      ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
                      {isCredit ? '⬇️' : '⬆️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {tx.first_name} {tx.last_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {tx.status} · {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                        {isCredit ? '+' : ''}{fmt(tx.amount)}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-600' :
                        tx.status === 'pending'   ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-500'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* FINANCIAL INSIGHTS */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Financial Insights</h3>
          <div className="space-y-3">
            {INSIGHTS.map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 ml-auto" />
              </div>
            ))}
          </div>
        </section>

        {/* bottom spacer */}
        <div className="h-2" />
      </div>

      {/* Interbank Transfer Modal */}
      {showInterbank && (
        <InterbankTransferModal
          senderAccountNumber={accountNumber}
          senderName={displayName}
          onClose={() => setShowInterbank(false)}
          onSuccess={() => {
            setShowInterbank(false)
            // Immediate silent refresh after transfer
            refreshBalance(true)
          }}
        />
      )}
    </div>
  )
}
