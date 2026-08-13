import { useState, useEffect } from 'react'
import { walletsAPI, transactionsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import {
  Send, Plus, ChevronRight, Eye, EyeOff,
  RefreshCw, X, Landmark, Wallet, PiggyBank,
  Users, Star, ArrowDownLeft, ArrowUpRight, Check
} from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n ?? 0)

const BENEFICIARIES = [
  { id: 'b1', name: 'Alice Johnson',  bank: 'Chase',    account: '••••4521', avatar: 'AJ', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'b2', name: 'Bob Smith',      bank: 'BoA',      account: '••••7890', avatar: 'BS', color: 'bg-sky-100 text-sky-600' },
  { id: 'b3', name: 'Carol Williams', bank: 'Wells',    account: '••••3345', avatar: 'CW', color: 'bg-violet-100 text-violet-600' },
  { id: 'b4', name: 'David Brown',    bank: 'Citi',     account: '••••6612', avatar: 'DB', color: 'bg-emerald-100 text-emerald-600' },
]

const SAVINGS = [
  { name: 'Emergency Fund', target: 5000,  current: 3200, color: 'from-indigo-500 to-violet-500', emoji: '🛡️' },
  { name: 'Vacation 2026',  target: 3000,  current: 1100, color: 'from-sky-500 to-cyan-500',      emoji: '✈️' },
  { name: 'New Laptop',     target: 1500,  current: 980,  color: 'from-orange-400 to-amber-400',  emoji: '💻' },
]

const LINKED_ACCOUNTS = [
  { bank: 'Chase Bank',        type: 'Checking', last4: '4521', icon: '🏦', color: 'bg-blue-50' },
  { bank: 'Bank of America',   type: 'Savings',  last4: '7890', icon: '🏛️', color: 'bg-red-50'  },
  { bank: 'PayPal',            type: 'Digital',  last4: '—',    icon: '🅿️', color: 'bg-sky-50'  },
]

export default function WalletPage() {
  const { user } = useAuth()
  const [wallet,      setWallet]      = useState(null)
  const [wallets,     setWallets]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [hideBalance, setHideBalance] = useState(false)
  const [activeTab,   setActiveTab]   = useState('overview')  // overview | savings | linked | beneficiaries
  const [showTransfer,setShowTransfer]= useState(false)
  const [transfer,    setTransfer]    = useState({ recipientId: '', amount: '', description: '' })
  const [transferring,setTransferring]= useState(false)
  const [done,        setDone]        = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [myRes, allRes] = await Promise.all([
        walletsAPI.getBalance(),
        walletsAPI.getAll({ page: 1, limit: 20 }),
      ])
      setWallet(myRes.data.wallet)
      setWallets(allRes.data.wallets)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const doTransfer = async (e) => {
    e.preventDefault()
    setTransferring(true)
    try {
      await walletsAPI.transfer(transfer)
      setDone(true)
      setTimeout(() => {
        setDone(false); setShowTransfer(false)
        setTransfer({ recipientId: '', amount: '', description: '' })
        load()
      }, 1600)
    } catch (err) {
      alert(err.response?.data?.message || 'Transfer failed')
    } finally { setTransferring(false) }
  }

  const TABS = [
    { id: 'overview',      label: 'Overview',     icon: Wallet    },
    { id: 'savings',       label: 'Savings',      icon: PiggyBank },
    { id: 'linked',        label: 'Linked',        icon: Landmark  },
    { id: 'beneficiaries', label: 'Contacts',     icon: Users     },
  ]

  return (
    <div className="space-y-0">
      {/* Balance strip — bleeds under header gradient */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-2 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Wallet Balance</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-white">
                {hideBalance ? '••••••' : loading ? '...' : fmt(wallet?.balance)}
              </span>
              <button onClick={() => setHideBalance(v => !v)} className="mb-1 text-white/50 hover:text-white">
                {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-white/50 text-xs mt-1">{wallet?.currency ?? 'USD'}</p>
          </div>
          <button onClick={() => setShowTransfer(true)}
            className="flex items-center gap-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all">
            <Send className="w-4 h-4" /> Transfer
          </button>
        </div>
      </div>

      <div className="bg-[#f0f4ff] px-4 pt-4 space-y-4">

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold transition-all
                ${activeTab === id ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800">All Accounts</h3>
            {loading ? (
              <div className="py-8 flex justify-center"><RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" /></div>
            ) : wallets.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold uppercase">
                  {w.first_name?.[0]}{w.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{w.first_name} {w.last_name}</p>
                  <p className="text-xs text-gray-400">{w.email}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${w.balance > 1000 ? 'text-green-600' : 'text-gray-800'}`}>
                    {hideBalance ? '••••' : fmt(w.balance)}
                  </p>
                  <p className="text-[10px] text-gray-400">{w.currency}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SAVINGS ── */}
        {activeTab === 'savings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Savings Goals</h3>
              <button className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                <Plus className="w-3.5 h-3.5" /> New Goal
              </button>
            </div>
            {SAVINGS.map(({ name, target, current, color, emoji }) => {
              const pct = Math.round((current / target) * 100)
              return (
                <div key={name} className={`bg-gradient-to-r ${color} rounded-2xl p-4 shadow-sm text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{emoji}</span>
                      <span className="font-semibold text-sm">{name}</span>
                    </div>
                    <Star className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex justify-between text-xs text-white/80 mb-2">
                    <span>{fmt(current)} saved</span>
                    <span>Goal: {fmt(target)}</span>
                  </div>
                  <div className="w-full bg-white/25 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-white/80 text-[10px] mt-1.5">{pct}% complete</p>
                </div>
              )
            })}
          </div>
        )}

        {/* ── LINKED ACCOUNTS ── */}
        {activeTab === 'linked' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Linked Accounts</h3>
              <button className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                <Plus className="w-3.5 h-3.5" /> Link Account
              </button>
            </div>
            {LINKED_ACCOUNTS.map(({ bank, type, last4, icon, color }) => (
              <div key={bank} className={`${color} rounded-2xl p-4 flex items-center gap-3`}>
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{bank}</p>
                  <p className="text-xs text-gray-500">{type} {last4 !== '—' ? `· ••••${last4}` : ''}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Plus className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Add New Account</p>
                <p className="text-xs text-gray-400">Link a bank or digital wallet</p>
              </div>
            </div>
          </div>
        )}

        {/* ── BENEFICIARIES ── */}
        {activeTab === 'beneficiaries' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Saved Contacts</h3>
              <button className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>
            {BENEFICIARIES.map(({ id, name, bank, account, avatar, color }) => (
              <div key={id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${color}`}>
                  {avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">{bank} · {account}</p>
                </div>
                <button onClick={() => { setTransfer(f => ({ ...f, recipientId: id })); setShowTransfer(true) }}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-600 rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-indigo-100 transition-colors">
                  <Send className="w-3 h-3" /> Send
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="h-2" />
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2">
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10 shadow-2xl" onClick={e => e.stopPropagation()}>
            {done ? (
              <div className="py-8 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg font-bold text-gray-800">Transfer Successful!</p>
                <p className="text-sm text-gray-400">Funds have been sent.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-800 text-lg">Send Money</h3>
                  <button onClick={() => setShowTransfer(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                {wallet && (
                  <div className="mb-4 p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium">
                    Available: {fmt(wallet.balance)}
                  </div>
                )}
                <form onSubmit={doTransfer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Recipient User ID</label>
                    <input type="text" required
                      value={transfer.recipientId}
                      onChange={e => setTransfer(f => ({ ...f, recipientId: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter recipient UUID" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">$</span>
                      <input type="number" step="0.01" min="0.01" required
                        value={transfer.amount}
                        onChange={e => setTransfer(f => ({ ...f, amount: e.target.value }))}
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Note (optional)</label>
                    <input type="text"
                      value={transfer.description}
                      onChange={e => setTransfer(f => ({ ...f, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add a note…" />
                  </div>
                  <button type="submit" disabled={transferring}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
                    {transferring ? 'Processing…' : 'Send Money'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
