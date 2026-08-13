import { useState } from 'react'
import { X, Lock, Eye, EyeOff, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { usersAPI } from '../services/api'

export default function SetPinModal({ onClose, onSuccess }) {
  const [pin,     setPin]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const validate = () => {
    if (!pin)                    return 'PIN is required'
    if (!/^\d{4,6}$/.test(pin)) return 'PIN must be 4–6 numeric digits'
    if (pin !== confirm)         return 'PINs do not match'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')
    try {
      await usersAPI.setPin({ pin })
      setDone(true)
      setTimeout(() => { if (onSuccess) onSuccess(); onClose() }, 1500)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to set PIN. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2"
      onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl p-6 pb-10"
        onClick={e => e.stopPropagation()}>

        {done ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-bold text-gray-800">PIN Set Successfully!</p>
            <p className="text-sm text-gray-400">You can now use your PIN for transfers.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-gray-800 text-lg">Set Transaction PIN</h3>
                <p className="text-xs text-gray-400 mt-0.5">Required for authorizing transfers</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">New PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    placeholder="4–6 digits"
                    maxLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  />
                  <button type="button" onClick={() => setShowPin(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Confirm PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    placeholder="Re-enter PIN"
                    maxLength={6}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
                      ${confirm && pin && confirm !== pin ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                </div>
                {confirm && pin && confirm !== pin && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />PINs do not match
                  </p>
                )}
              </div>

              <p className="text-[10px] text-gray-400 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                ⚠️ Keep your PIN confidential. Never share it with anyone.
              </p>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Setting PIN…</> : 'Set Transaction PIN'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
