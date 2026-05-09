import { useState, useEffect } from 'react'
import { walletsAPI } from '../services/api'
import { RefreshCw, Send, X } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function Wallets() {
  const [wallets, setWallets]   = useState([])
  const [pagination, setPag]    = useState({})
  const [loading, setLoading]   = useState(true)
  const [myWallet, setMyWallet] = useState(null)
  const [showTransfer, setShowTransfer] = useState(false)
  const [form, setForm]         = useState({ recipientId: '', amount: '', description: '' })
  const [transferring, setTransferring] = useState(false)
  const [page, setPage]         = useState(1)

  const load = async (pg = 1) => {
    setLoading(true)
    try {
      const [allRes, myRes] = await Promise.all([
        walletsAPI.getAll({ page: pg, limit: 15 }),
        walletsAPI.getBalance(),
      ])
      setWallets(allRes.data.wallets)
      setPag(allRes.data.pagination)
      setMyWallet(myRes.data.wallet)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const doTransfer = async (e) => {
    e.preventDefault()
    setTransferring(true)
    try {
      await walletsAPI.transfer(form)
      setShowTransfer(false)
      setForm({ recipientId: '', amount: '', description: '' })
      load()
      alert('Transfer successful!')
    } catch (e) { alert(e.response?.data?.message || 'Transfer failed') }
    finally { setTransferring(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wallets</h1>
          <p className="text-sm text-gray-500">{pagination.total || 0} total wallets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTransfer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
            <Send className="w-4 h-4" /> Transfer
          </button>
          <button onClick={() => load(page)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* My Wallet Card */}
      {myWallet && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-indigo-200 text-sm mb-1">My Wallet Balance</p>
          <p className="text-4xl font-bold">{fmt(myWallet.balance)}</p>
          <p className="text-indigo-200 text-sm mt-2">{myWallet.currency} • {myWallet.email}</p>
        </div>
      )}

      {/* All Wallets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">All Wallets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 text-left font-medium">User</th>
                <th className="px-5 py-3 text-left font-medium">Balance</th>
                <th className="px-5 py-3 text-left font-medium">Currency</th>
                <th className="px-5 py-3 text-left font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…
                </td></tr>
              ) : wallets.map(w => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 uppercase">
                        {w.first_name?.[0]}{w.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{w.first_name} {w.last_name}</p>
                        <p className="text-xs text-gray-400">{w.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-bold text-base ${w.balance > 1000 ? 'text-green-600' : w.balance > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                      {fmt(w.balance)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{w.currency}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(w.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => { setPage(p); load(p) }}
                  className={`w-7 h-7 rounded text-xs font-medium ${p === pagination.page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTransfer(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Transfer Funds</h3>
              <button onClick={() => setShowTransfer(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {myWallet && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg text-sm">
                <span className="text-indigo-600 font-medium">Available: {fmt(myWallet.balance)}</span>
              </div>
            )}
            <form onSubmit={doTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient User ID</label>
                <input type="text" required
                  value={form.recipientId} onChange={e => setForm(f => ({...f, recipientId: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="User UUID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <input type="number" step="0.01" min="0.01" required
                  value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text"
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowTransfer(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={transferring}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60">
                  {transferring ? 'Transferring…' : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
