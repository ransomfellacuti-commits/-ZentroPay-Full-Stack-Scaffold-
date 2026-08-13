import { useState, useEffect, useRef, useCallback } from 'react'
import { transactionsAPI, usersAPI, transfersAPI } from '../services/api'
import {
  Search, Plus, X, Filter, RefreshCw, Check,
  ArrowUpRight, ArrowDownLeft, Globe, Eye
} from 'lucide-react'
import InterbankTransferModal from '../components/InterbankTransferModal'
import ReceiptModal from '../components/ReceiptModal'

const fmt     = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n ?? 0)
const fmtDate = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const STATUS_PILL = {
  completed: 'bg-green-100  text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  failed:    'bg-red-100    text-red-600',
  cancelled: 'bg-gray-100   text-gray-500',
}

const FILTER_TABS = ['All', 'Completed', 'Pending', 'Failed']

const METHOD_ICONS = {
  card:          '💳',
  bank_transfer: '🏦',
  wallet:        '👛',
  stripe:        '⚡',
  flutterwave:   '🦋',
}

/* ── Polling interval: 15 seconds ────────────────────────────────────── */
const POLL_INTERVAL = 15_000

export default function Transactions() {
  const [txs,         setTxs]         = useState([])
  const [pagination,  setPag]         = useState({})
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('All')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [selected,    setSelected]    = useState(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [createForm,  setCreateForm]  = useState({ amount: '', currency: 'USD', description: '', paymentMethod: 'card' })
  const [creating,    setCreating]    = useState(false)
  const [createDone,  setCreateDone]  = useState(false)
  const [liveUpdate,  setLiveUpdate]  = useState(false)

  // Interbank transfer state
  const [showInterbank, setShowInterbank] = useState(false)
  const [senderAcct,    setSenderAcct]    = useState('')
  const [viewReceipt,   setViewReceipt]   = useState(null)

  const pollRef    = useRef(null)
  const currentPage = useRef(1)
  const currentFilter = useRef('All')

  const statusParam = filter === 'All' ? undefined : filter.toLowerCase()

  /* ── Full load with spinner ─────────────────────────────────────────── */
  const load = useCallback(async (pg = 1, st = undefined) => {
    setLoading(true)
    try {
      const res = await transactionsAPI.getAll({ page: pg, limit: 15, status: st })
      setTxs(res.data.transactions)
      setPag(res.data.pagination)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  /* ── Silent poll — no spinner, just updates list ────────────────────── */
  const silentPoll = useCallback(async () => {
    try {
      const pg = currentPage.current
      const f  = currentFilter.current === 'All' ? undefined : currentFilter.current.toLowerCase()
      const res = await transactionsAPI.getAll({ page: pg, limit: 15, status: f })
      const incoming = res.data.transactions ?? []
      setTxs(prev => {
        // Only update if top transaction changed (new tx arrived)
        if (incoming[0]?.id !== prev[0]?.id || incoming.length !== prev.length) {
          setLiveUpdate(true)
          setTimeout(() => setLiveUpdate(false), 800)
          return incoming
        }
        return prev
      })
      setPag(res.data.pagination)
    } catch { /* silent */ }
  }, [])

  // Load sender account number once
  useEffect(() => {
    usersAPI.getProfile().then(r => {
      setSenderAcct(r.data?.user?.account_number || '')
    }).catch(() => {})
  }, [])

  // Initial load + start polling
  useEffect(() => {
    currentFilter.current = filter
    load(1, filter === 'All' ? undefined : filter.toLowerCase())
    currentPage.current = 1
    clearInterval(pollRef.current)
    pollRef.current = setInterval(silentPoll, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [filter])

  // Track page changes for polling
  useEffect(() => {
    currentPage.current = page
  }, [page])

  const filteredTxs = search
    ? txs.filter(t =>
        `${t.first_name} ${t.last_name} ${t.email} ${t.transaction_reference} ${t.description}`.toLowerCase().includes(search.toLowerCase())
      )
    : txs

  const doCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await transactionsAPI.create(createForm)
      setCreateDone(true)
      setTimeout(() => {
        setCreateDone(false); setShowCreate(false)
        setCreateForm({ amount: '', currency: 'USD', description: '', paymentMethod: 'card' })
        load(currentPage.current, currentFilter.current === 'All' ? undefined : currentFilter.current.toLowerCase())
      }, 1500)
    } catch (err) { alert(err.response?.data?.message || 'Failed') }
    finally { setCreating(false) }
  }

  // Called when interbank transfer succeeds — immediate refresh
  const handleTransferSuccess = () => {
    setShowInterbank(false)
    silentPoll()
  }

  return (
    <div className="space-y-0">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-2 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-xl">Transactions</h2>
            <p className="text-white/60 text-xs">{pagination.total ?? 0} total records</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-xl px-3 py-2 text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full pl-10 pr-10 py-2.5 bg-white/15 backdrop-blur text-white placeholder-white/40 rounded-xl text-sm focus:outline-none focus:bg-white/25 transition-colors"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#f0f4ff] px-4 pt-3 space-y-3">
        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Transfer / Payment header section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-50">
            {[
              { icon: ArrowUpRight, label: 'Send',             color: 'text-indigo-600 bg-indigo-50',  action: () => setShowCreate(true) },
              { icon: ArrowDownLeft,label: 'Request',           color: 'text-green-600  bg-green-50',   action: () => {} },
              { icon: Globe,        label: 'Interbank',         color: 'text-violet-600 bg-violet-50',  action: () => setShowInterbank(true) },
            ].map(({ icon: Icon, label, color, action }) => (
              <button key={label}
                onClick={action}
                className="flex-1 flex flex-col items-center gap-1.5 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600">{label}</span>
              </button>
            ))}
          </div>

          {/* Interbank call-to-action banner */}
          <button onClick={() => setShowInterbank(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 transition-colors border-t border-violet-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-indigo-800">Transfer to Other Bank Account</p>
              <p className="text-xs text-indigo-400">500+ banks · 140+ countries · Instant transfer</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

        {/* Transaction list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Transaction History</span>
              {liveUpdate && (
                <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full animate-pulse">
                  Updated
                </span>
              )}
            </div>
            <button onClick={() => load(currentPage.current, currentFilter.current === 'All' ? undefined : currentFilter.current.toLowerCase())}
              className="text-gray-400 hover:text-gray-600">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : filteredTxs.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No transactions found</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredTxs.map(tx => {
                const isCredit = tx.amount > 0
                return (
                  <button key={tx.id} onClick={() => setSelected(tx)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
                      {METHOD_ICONS[tx.payment_method] ?? (isCredit ? '⬇️' : '⬆️')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {tx.description || `${tx.payment_method} payment`}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDate(tx.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                        {isCredit ? '+' : ''}{fmt(tx.amount)}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_PILL[tx.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">Page {pagination.page} / {pagination.pages}</span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => { setPage(p); load(p, currentFilter.current === 'All' ? undefined : currentFilter.current.toLowerCase()) }}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                      ${p === pagination.page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="h-2" />
      </div>

      {/* ── Detail Sheet ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2"
          onClick={() => setSelected(null)}>
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Transaction Details</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="text-center mb-5">
              <p className={`text-3xl font-extrabold ${selected.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {selected.amount > 0 ? '+' : ''}{fmt(selected.amount)}
              </p>
              <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_PILL[selected.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {selected.status}
              </span>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                ['Reference',   selected.transaction_reference?.slice(0, 28) || '—'],
                ['Method',      selected.payment_method],
                ['From/To',     `${selected.first_name ?? ''} ${selected.last_name ?? ''}`.trim() || '—'],
                ['Description', selected.description || '—'],
                ['Date',        fmtDate(selected.created_at)],
                ['Currency',    selected.currency],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium text-gray-700 text-right max-w-[55%] truncate capitalize">{v}</span>
                </div>
              ))}
            </div>
            {/* View receipt button if interbank transfer */}
            {selected.payment_method === 'bank_transfer' && (
              <button onClick={() => {
                setViewReceipt(selected.id)
                setSelected(null)
              }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors">
                <Eye className="w-4 h-4" />
                View Receipt
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Create Transaction Sheet ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2"
          onClick={() => setShowCreate(false)}>
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            {createDone ? (
              <div className="py-8 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg font-bold text-gray-800">Transaction Created!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-800 text-lg">New Transaction</h3>
                  <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={doCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                      <input type="number" step="0.01" min="0.01" required
                        value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Payment Method</label>
                    <select value={createForm.paymentMethod}
                      onChange={e => setCreateForm(f => ({ ...f, paymentMethod: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {['card', 'bank_transfer', 'wallet', 'stripe', 'flutterwave'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description</label>
                    <input type="text"
                      value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Optional note" />
                  </div>
                  <button type="submit" disabled={creating}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
                    {creating ? 'Processing…' : 'Create Transaction'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Interbank Transfer Modal ── */}
      {showInterbank && (
        <InterbankTransferModal
          senderAccountNumber={senderAcct}
          onClose={() => setShowInterbank(false)}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* ── View Receipt by Transaction ID ── */}
      {viewReceipt && (
        <ReceiptFetcher txId={viewReceipt} onClose={() => setViewReceipt(null)} />
      )}
    </div>
  )
}

/* ── Helper: fetch and display receipt for existing tx ──────────────────── */
function ReceiptFetcher({ txId, onClose }) {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    transfersAPI.getReceipt(txId).then(r => {
      setReceipt(r.data.receipt)
    }).catch(() => {
      setReceipt(null)
    }).finally(() => setLoading(false))
  }, [txId])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2">
        <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-gray-500">Loading receipt…</p>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2">
        <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500">No receipt found for this transaction.</p>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">Close</button>
        </div>
      </div>
    )
  }

  return <ReceiptModal receipt={receipt} onClose={onClose} />
}
