import { useState, useEffect } from 'react'
import { transactionsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import {
  TrendingUp, Users, CreditCard, Wallet, ArrowUpRight,
  ArrowDownRight, Activity, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n)

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6']

function StatCard({ title, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await transactionsAPI.getStats()
      setStats(res.data.stats)
    } catch (e) {
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
  )

  const statusData = [
    { name: 'Completed', value: stats.transactions.total - stats.transactions.pending },
    { name: 'Pending',   value: stats.transactions.pending },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.first_name}! Here's what's happening.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Volume"      value={fmt(stats.transactions.volume)}       sub={`Today: ${fmt(stats.transactions.todayVolume)}`} icon={TrendingUp} color="bg-indigo-50 text-indigo-600" trend="up" />
        <StatCard title="Total Users"       value={fmtNum(stats.users.total)}            sub={`${stats.users.active} active`}                  icon={Users}     color="bg-green-50 text-green-600"  trend="up" />
        <StatCard title="Transactions"      value={fmtNum(stats.transactions.total)}     sub={`Today: ${stats.transactions.today}`}             icon={CreditCard}color="bg-blue-50 text-blue-600"   trend="up" />
        <StatCard title="Total Wallet Bal." value={fmt(stats.wallet.totalBalance)}       sub={`${stats.transactions.pending} pending`}          icon={Wallet}    color="bg-purple-50 text-purple-600" trend="up" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Transaction Volume</h3>
          {stats.monthlyVolume?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.monthlyVolume}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmt(v)} />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fill="url(#colorVol)" name="Volume" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Transaction Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" /> Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-5 py-3 text-left font-medium">User</th>
                <th className="px-5 py-3 text-left font-medium">Amount</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 uppercase">
                        {tx.first_name?.[0]}{tx.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{tx.first_name} {tx.last_name}</p>
                        <p className="text-xs text-gray-400">{tx.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{fmt(tx.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
