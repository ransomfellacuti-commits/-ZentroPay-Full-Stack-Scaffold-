import { useState, useEffect } from 'react'
import { transactionsAPI } from '../services/api'
import { Search, RefreshCw, Plus, X } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
const fmtDate = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  failed:    'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function Transactions() {
  const [txs, setTxs]           = useState([])
  const [pagination, setPag]    = useState({})
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ amount: '', currency: 'USD', description: '', paymentMethod: 'card' })
  const [creating, setCreating] = useState(false)

  const load = async (pg = 1, st = filter) => {
    setLoading(true)
    try {
      const res = await transactionsAPI.getAll({ page: pg, limit: 15, status: st || undefined })
      setTxs(res.data.transactions)
      setPag(res.data.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleFilterChange = (val) => {
    setFilter(val); setPage(1); load(1, val)
  }

  const createTransaction = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await transactionsAPI.create(createForm)
      setShowCreate(false)
      setCreateForm({ amount: '', currency: 'USD', description: '', paymentMethod: 'card' })
      load()
    } catch (e) { alert(e.response?.data?.message || 'Failed to create transaction') }
    finally { setCreating(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500">{pagination.total || 0} total transactions</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'completed', 'pending', 'failed', 'cancelled'].map(s => (
          <button key={s} onClick={() => handleFilterChange(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
        <button onClick={() => load(page, filter)}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 text-left font-medium">Reference</th>
                <th className="px-5 py-3 text-left font-medium">User</th>
                <th className="px-5 py-3 text-left font-medium">Amount</th>
                <th className="px-5 py-3 text-left font-medium">Method</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…
                </td></tr>
              ) : txs.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No transactions found</td></tr>
              ) : txs.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(tx)}>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                      {tx.transaction_reference?.slice(0, 20) || tx.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-gray-700">{tx.first_name} {tx.last_name}</p>
                      <p className="text-xs text-gray-400">{tx.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                      {fmt(tx.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{tx.payment_method}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-600'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(tx.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 8) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => { setPage(p); load(p) }}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === pagination.page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Transaction Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center mb-4">
              <p className={`text-3xl font-bold ${selected.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(selected.amount)}</p>
              <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-sm font-medium ${STATUS_COLORS[selected.status] || 'bg-gray-100 text-gray-600'}`}>
                {selected.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['ID', selected.id.slice(0, 16) + '…'],
                ['Reference', selected.transaction_reference || '—'],
                ['User', `${selected.first_name} ${selected.last_name}`],
                ['Email', selected.email],
                ['Method', selected.payment_method],
                ['Currency', selected.currency],
                ['Description', selected.description || '—'],
                ['Date', fmtDate(selected.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-700 text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">New Transaction</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <input type="number" step="0.01" min="0.01" required
                  value={createForm.amount} onChange={e => setCreateForm(f => ({...f, amount: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={createForm.paymentMethod} onChange={e => setCreateForm(f => ({...f, paymentMethod: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {['card','bank_transfer','wallet','stripe','flutterwave'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text"
                  value={createForm.description} onChange={e => setCreateForm(f => ({...f, description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional description" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60">
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
