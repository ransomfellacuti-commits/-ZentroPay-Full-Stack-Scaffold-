import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { Search, UserCheck, UserX, RefreshCw, Eye, Shield, X, ChevronLeft } from 'lucide-react'

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users,      setUsers]      = useState([])
  const [pagination, setPag]        = useState({})
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)

  const load = async (pg = 1, q = search) => {
    setLoading(true)
    try {
      const res = await usersAPI.getAll({ page: pg, limit: 15, search: q })
      setUsers(res.data.users)
      setPag(res.data.pagination)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(1, search) }
  const toggleStatus = async (id) => { try { await usersAPI.toggleStatus(id); load() } catch (e) { alert(e.response?.data?.message || 'Error') } }
  const viewUser     = async (id) => { try { const r = await usersAPI.getById(id); setSelected(r.data.user) } catch { alert('Failed') } }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-2 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-white font-bold text-xl">User Management</h2>
            <p className="text-white/60 text-xs">{pagination.total ?? 0} registered users</p>
          </div>
        </div>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full pl-9 pr-4 py-2.5 bg-white/15 backdrop-blur text-white placeholder-white/40 rounded-xl text-sm focus:outline-none focus:bg-white/25 transition-colors" />
          </div>
          <button type="submit" className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="bg-[#f0f4ff] px-4 pt-4 space-y-3">
        {loading ? (
          <div className="py-12 flex justify-center"><RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" /></div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No users found</p>
        ) : users.map(u => (
          <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 uppercase flex-shrink-0">
              {u.first_name?.[0]}{u.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p>
                {u.role === 'admin' && <Shield className="w-3 h-3 text-purple-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] text-gray-400">{fmt(u.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => viewUser(u.id)}
                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => toggleStatus(u.id)}
                className={`p-2 rounded-xl transition-colors ${u.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-gray-400">Page {pagination.page} / {pagination.pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 6) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => { setPage(p); load(p) }}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="h-2" />
      </div>

      {/* Detail sheet */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2"
          onClick={() => setSelected(null)}>
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">User Details</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700 uppercase">
                {selected.first_name?.[0]}{selected.last_name?.[0]}
              </div>
              <div>
                <p className="font-bold text-gray-800">{selected.first_name} {selected.last_name}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Role',    selected.role],
                ['Status',  selected.is_active ? '✅ Active' : '❌ Inactive'],
                ['Verified',selected.is_verified ? '✅ Yes' : '❌ No'],
                ['Phone',   selected.phone || '—'],
                ['Balance', selected.balance != null ? `$${parseFloat(selected.balance).toFixed(2)} ${selected.currency}` : '—'],
                ['Joined',  fmt(selected.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-semibold text-gray-700 capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
