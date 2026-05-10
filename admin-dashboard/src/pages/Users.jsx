import { useState, useEffect } from 'react'
import { usersAPI } from '../services/api'
import { Search, UserCheck, UserX, RefreshCw, Eye, Shield } from 'lucide-react'

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export default function Users() {
  const [users, setUsers]       = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState(null)

  const load = async (pg = page, q = search) => {
    setLoading(true)
    try {
      const res = await usersAPI.getAll({ page: pg, limit: 15, search: q })
      setUsers(res.data.users)
      setPagination(res.data.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load(1, search)
  }

  const toggleStatus = async (id) => {
    try {
      await usersAPI.toggleStatus(id)
      load()
    } catch (e) { alert(e.response?.data?.message || 'Error') }
  }

  const viewUser = async (id) => {
    try {
      const res = await usersAPI.getById(id)
      setSelected(res.data.user)
    } catch (e) { alert('Failed to load user') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500">{pagination.total || 0} total users</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
          Search
        </button>
        <button type="button" onClick={() => { setSearch(''); setPage(1); load(1, '') }}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 text-left font-medium">User</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading…
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 uppercase">
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`flex items-center gap-1 text-xs font-medium w-fit px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' && <Shield className="w-3 h-3" />} {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{fmt(u.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => viewUser(u.id)} title="View"
                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(u.id)} title={u.is_active ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                        {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => { setPage(p); load(p) }}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors ${p === pagination.page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">User Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700 uppercase">
                {selected.first_name?.[0]}{selected.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{selected.first_name} {selected.last_name}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Role', selected.role],
                ['Status', selected.is_active ? '✅ Active' : '❌ Inactive'],
                ['Verified', selected.is_verified ? '✅ Yes' : '❌ No'],
                ['Phone', selected.phone || '—'],
                ['Wallet Balance', selected.balance != null ? `$${parseFloat(selected.balance).toFixed(2)} ${selected.currency}` : '—'],
                ['Joined', fmt(selected.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-700 capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
