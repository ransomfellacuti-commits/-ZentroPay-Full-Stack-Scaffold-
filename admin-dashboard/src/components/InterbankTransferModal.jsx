import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  X, Search, Building2, User, Hash,
  FileText, Lock, ArrowRight, RefreshCw, Check,
  AlertCircle, Eye, EyeOff, ChevronRight, Sparkles
} from 'lucide-react'
import { transfersAPI } from '../services/api'
import ReceiptModal from './ReceiptModal'

/* ─── Amount formatter ──────────────────────────────────────────────────── */
function formatAmount(raw) {
  // strip non-numeric except dot
  const str = String(raw).replace(/[^\d.]/g, '')
  const parts = str.split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (parts.length > 1) return intPart + '.' + parts[1].slice(0, 2)
  return intPart
}

function parseAmount(formatted) {
  return parseFloat(String(formatted).replace(/,/g, '')) || 0
}

/* ─── Field wrapper ─────────────────────────────────────────────────────── */
function Field({ label, error, touched, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
      {touched && error && (
        <p className="flex items-center gap-1 text-xs text-red-500 animate-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/* ─── Bank Search Dropdown ──────────────────────────────────────────────── */
function BankSearchDropdown({ value, onChange, error, touched }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [open,     setOpen]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [focused,  setFocused]  = useState(false)
  const inputRef   = useRef(null)
  const dropRef    = useRef(null)
  const debounce   = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = useCallback((q) => {
    clearTimeout(debounce.current)
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      try {
        const res = await transfersAPI.getBanks(q.trim(), 60)
        setResults(res.data.banks || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [])

  const handleInput = (e) => {
    const q = e.target.value
    setQuery(q)
    setOpen(true)
    if (value) onChange(null) // clear selection on new input
    search(q)
  }

  const handleSelect = (bank) => {
    onChange(bank)
    setQuery(bank.bankName)
    setOpen(false)
  }

  const handleFocus = () => {
    setFocused(true)
    setOpen(true)
    if (!query && !value) search(' ') // show top results on focus
  }

  const displayValue = value ? value.bankName : query
  const hasError = touched && error

  return (
    <div ref={dropRef} className="relative">
      <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200
        ${hasError ? 'border-red-300 bg-red-50'
          : focused ? 'border-indigo-400 bg-white shadow-md shadow-indigo-100'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
        <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          placeholder="Search bank name, country, or SWIFT code…"
          autoComplete="off"
          className="w-full pl-11 pr-12 py-4 bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none rounded-2xl"
        />
        <div className="absolute right-4 flex items-center gap-1.5">
          {loading && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
          {value && (
            <button type="button"
              onClick={() => { onChange(null); setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }}
              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Selected bank preview */}
      {value && (
        <div className="mt-2 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
          <span className="text-2xl">{value.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-indigo-900 truncate">{value.bankName}</p>
            <p className="text-xs text-indigo-400">{value.countryName} · {value.currency}{value.swift ? ` · ${value.swift}` : ''}</p>
          </div>
          <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        </div>
      )}

      {/* Dropdown */}
      {open && !value && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-72 overflow-hidden flex flex-col">
          {/* Search hint */}
          {!query && !loading && (
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Type to search from 500+ banks across 140+ countries
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 px-4 py-4">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-sm text-gray-400">Searching…</span>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="px-4 py-6 text-center">
              <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No banks found for "<span className="font-medium">{query}</span>"</p>
              <p className="text-xs text-gray-300 mt-1">Try searching by country or SWIFT code</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="overflow-y-auto">
              {results.map((bank, i) => (
                <button key={`${bank.countryCode}-${bank.bankName}-${i}`}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(bank) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <span className="text-xl flex-shrink-0">{bank.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{bank.bankName}</p>
                    <p className="text-xs text-gray-400">{bank.countryName} · {bank.currency}</p>
                  </div>
                  {bank.swift && (
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg flex-shrink-0 hidden sm:block">
                      {bank.swift.slice(0, 8)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Amount Input ──────────────────────────────────────────────────────── */
function AmountInput({ value, onChange, onBlur, error, touched, currency }) {
  const [raw, setRaw] = useState(value || '')
  const inputRef = useRef(null)

  useEffect(() => {
    // sync if parent resets
    if (!value) setRaw('')
  }, [value])

  const handleChange = (e) => {
    let v = e.target.value.replace(/[^\d.]/g, '')
    // allow only one decimal point
    const parts = v.split('.')
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('')
    // max 2 decimal places
    if (parts[1]?.length > 2) v = parts[0] + '.' + parts[1].slice(0, 2)
    setRaw(v)
    onChange(v)
  }

  const displayed = raw ? formatAmount(raw) : ''
  // We keep raw state for unformatted input, show formatted visually
  const [editing, setEditing] = useState(false)

  return (
    <div className={`relative rounded-2xl border-2 transition-all duration-200
      ${touched && error ? 'border-red-300 bg-red-50'
        : editing ? 'border-indigo-400 bg-white shadow-md shadow-indigo-100'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
      <div className="flex items-center px-4 py-4">
        <span className="text-2xl font-black text-indigo-600 mr-3 flex-shrink-0">
          {currency?.slice(0, 1) || '$'}
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={editing ? raw : (raw ? formatAmount(raw) : '')}
          onChange={handleChange}
          onFocus={() => setEditing(true)}
          onBlur={() => { setEditing(false); if (onBlur) onBlur() }}
          placeholder="0.00"
          className="flex-1 bg-transparent text-3xl font-black text-gray-800 placeholder-gray-200 focus:outline-none min-w-0"
        />
        {raw && parseAmount(raw) > 0 && (
          <div className="ml-3 text-right flex-shrink-0">
            <p className="text-xs text-gray-400 font-medium">{currency || 'USD'}</p>
          </div>
        )}
      </div>
      {/* formatted preview below the large input */}
      {raw && parseAmount(raw) > 0 && (
        <div className="px-4 pb-3 pt-0">
          <p className="text-xs text-gray-400">
            {new Intl.NumberFormat('en-US', {
              style: 'currency', currency: currency || 'USD',
              minimumFractionDigits: 2,
            }).format(parseAmount(raw))}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Step indicator ────────────────────────────────────────────────────── */
function Steps({ current }) {
  const steps = ['Bank', 'Details', 'Confirm']
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`flex items-center gap-1.5 ${i < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < current ? 'bg-green-500 text-white'
                : i === current ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-gray-100 text-gray-400'}`}>
              {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold transition-colors hidden sm:block
              ${i === current ? 'text-indigo-600' : i < current ? 'text-green-600' : 'text-gray-400'}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < current ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Main Modal ────────────────────────────────────────────────────────── */
export default function InterbankTransferModal({ onClose, senderAccountNumber, senderName, onSuccess }) {
  const [step,    setStep]    = useState(0)  // 0=bank, 1=details, 2=confirm
  const [bank,    setBank]    = useState(null)

  const [form, setForm] = useState({
    recipientName:    '',
    recipientAccount: '',
    amount:           '',
    description:      '',
    transactionPin:   '',
  })
  const [touched, setTouched] = useState({})
  const [errors,  setErrors]  = useState({})
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError,setApiErr]  = useState('')
  const [receipt, setReceipt] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  const validate = (field, val) => {
    switch (field) {
      case 'bank':            return !val ? 'Please select a destination bank' : ''
      case 'recipientName':  return !val?.trim() ? 'Recipient name required' : val.trim().length < 2 ? 'Name too short' : ''
      case 'recipientAccount': return !val?.trim() ? 'Account number required' : !/^\d{6,30}$/.test(val.trim()) ? 'Must be 6–30 digits' : ''
      case 'amount':         return !val || parseAmount(val) <= 0 ? 'Enter a valid amount' : ''
      case 'transactionPin': return !val ? 'PIN required' : !/^\d{4,6}$/.test(val) ? '4–6 digit PIN' : ''
      default: return ''
    }
  }

  const touch = (field, val) => {
    const err = validate(field, val ?? (field === 'bank' ? bank : form[field]))
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(e => ({ ...e, [field]: err }))
    return err
  }

  const handleFormChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    if (touched[field]) setErrors(e => ({ ...e, [field]: validate(field, val) }))
    setApiErr('')
  }

  const canProceedStep0 = !!bank
  const canProceedStep1 = !validate('recipientName', form.recipientName) &&
                          !validate('recipientAccount', form.recipientAccount) &&
                          !validate('amount', form.amount)

  const nextStep = () => {
    if (step === 0) {
      const e = validate('bank', bank)
      if (e) { setTouched(t => ({ ...t, bank: true })); setErrors(e2 => ({ ...e2, bank: e })); return }
      setStep(1)
    } else if (step === 1) {
      const fields = ['recipientName', 'recipientAccount', 'amount']
      const newErrors = {}
      fields.forEach(f => {
        newErrors[f] = validate(f, form[f])
        setTouched(t => ({ ...t, [f]: true }))
      })
      setErrors(e => ({ ...e, ...newErrors }))
      if (Object.values(newErrors).some(Boolean)) return
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    const pinErr = validate('transactionPin', form.transactionPin)
    if (pinErr) { touch('transactionPin', form.transactionPin); return }

    setLoading(true)
    setApiErr('')

    const bucket  = Math.floor(Date.now() / (5 * 60 * 1000))
    const idemKey = `${form.recipientAccount}-${parseAmount(form.amount)}-${bucket}`

    try {
      const res = await transfersAPI.create({
        recipientName:    form.recipientName.trim(),
        recipientAccount: form.recipientAccount.trim(),
        bankName:         bank.bankName,
        country:          bank.countryCode,
        currency:         bank.currency,
        amount:           parseAmount(form.amount),
        description:      form.description.trim(),
        transactionPin:   form.transactionPin,
        idempotencyKey:   idemKey,
      })

      if (res.data.success) {
        setSuccess(true)
        setReceipt(res.data.receipt)
        if (onSuccess) onSuccess(res.data.newBalance)
        setTimeout(() => setShowReceipt(true), 1800)
      }
    } catch (err) {
      setApiErr(err.response?.data?.message || 'Transfer failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success animation ──
  if (success && !showReceipt) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2 px-4">
        <div className="w-full bg-white rounded-3xl p-10 flex flex-col items-center gap-5 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
            <Check className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800">Transfer Sent!</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: bank?.currency || 'USD' })
                .format(parseAmount(form.amount))} to {form.recipientName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            Generating receipt…
          </div>
        </div>
      </div>
    )
  }

  // ── Show receipt ──
  if (showReceipt && receipt) {
    return <ReceiptModal receipt={receipt} onClose={onClose} />
  }

  const fmtAmt = parseAmount(form.amount) > 0
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: bank?.currency || 'USD',
        minimumFractionDigits: 2,
      }).format(parseAmount(form.amount))
    : null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2"
      onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-xl font-black text-gray-900">International Transfer</h2>
              <p className="text-xs text-gray-400 mt-0.5">500+ banks · 140+ countries</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Step indicator */}
          <Steps current={step} />

          {/* Sender info strip */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">
                {senderName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ME'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{senderName || 'Your Account'}</p>
              <p className="text-white/60 text-xs font-mono tracking-wider">{senderAccountNumber || '—'}</p>
            </div>
            {fmtAmt && step >= 1 && (
              <div className="text-right flex-shrink-0">
                <p className="text-white/70 text-[10px]">Amount</p>
                <p className="text-white font-black text-sm">{fmtAmt}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">

          {/* ── STEP 0: Bank Selection ── */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Destination Bank" error={errors.bank} touched={touched.bank}>
                <BankSearchDropdown
                  value={bank}
                  onChange={(b) => { setBank(b); setErrors(e => ({ ...e, bank: '' })); setTouched(t => ({ ...t, bank: true })) }}
                  error={errors.bank}
                  touched={touched.bank}
                />
              </Field>

              {/* Popular banks quick-select */}
              {!bank && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Popular Banks</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { bankName: 'DBS Bank', countryCode: 'SG', countryName: 'Singapore', flag: '🇸🇬', currency: 'SGD', swift: 'DBSSSGSG' },
                      { bankName: 'HSBC Hong Kong', countryCode: 'HK', countryName: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', swift: 'HSBCHKHH' },
                      { bankName: 'JPMorgan Chase', countryCode: 'US', countryName: 'United States', flag: '🇺🇸', currency: 'USD', swift: 'CHASUS33' },
                      { bankName: 'Barclays Bank', countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', swift: 'BARCGB22' },
                      { bankName: 'Maybank', countryCode: 'MY', countryName: 'Malaysia', flag: '🇲🇾', currency: 'MYR', swift: 'MBBEMYKL' },
                      { bankName: 'Deutsche Bank', countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', currency: 'EUR', swift: 'DEUTDEDB' },
                    ].map(b => (
                      <button key={b.bankName} type="button"
                        onClick={() => { setBank(b); setErrors(e => ({ ...e, bank: '' })) }}
                        className="flex items-center gap-2 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl px-3 py-2.5 transition-all text-left group">
                        <span className="text-lg">{b.flag}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-700 group-hover:text-indigo-700 truncate">{b.bankName}</p>
                          <p className="text-[10px] text-gray-400">{b.countryName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1: Transfer Details ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Selected bank reminder */}
              {bank && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-2xl">{bank.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{bank.bankName}</p>
                    <p className="text-xs text-gray-400">{bank.countryName} · {bank.currency}</p>
                  </div>
                  <button onClick={() => setStep(0)}
                    className="text-xs text-indigo-500 font-semibold hover:text-indigo-700">Change</button>
                </div>
              )}

              {/* Amount — large input first */}
              <Field label="Transfer Amount" error={errors.amount} touched={touched.amount}>
                <AmountInput
                  value={form.amount}
                  currency={bank?.currency}
                  onChange={(v) => handleFormChange('amount', v)}
                  onBlur={() => touch('amount')}
                  error={errors.amount}
                  touched={touched.amount}
                />
              </Field>

              {/* Recipient Name */}
              <Field label="Recipient Full Name" error={errors.recipientName} touched={touched.recipientName}>
                <div className={`flex items-center rounded-2xl border-2 transition-all duration-200
                  ${touched.recipientName && errors.recipientName
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-indigo-100'}`}>
                  <User className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                  <input
                    type="text" autoComplete="off"
                    value={form.recipientName}
                    onChange={e => handleFormChange('recipientName', e.target.value)}
                    onBlur={() => touch('recipientName')}
                    placeholder="e.g. John Smith"
                    className="flex-1 pl-3 pr-4 py-4 bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </Field>

              {/* Recipient Account Number */}
              <Field label="Recipient Account Number" error={errors.recipientAccount} touched={touched.recipientAccount}>
                <div className={`flex items-center rounded-2xl border-2 transition-all duration-200
                  ${touched.recipientAccount && errors.recipientAccount
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-indigo-100'}`}>
                  <Hash className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                  <input
                    type="text" inputMode="numeric" autoComplete="off"
                    value={form.recipientAccount}
                    onChange={e => handleFormChange('recipientAccount', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => touch('recipientAccount')}
                    placeholder="Account / IBAN number"
                    maxLength={30}
                    className="flex-1 pl-3 pr-4 py-4 bg-transparent text-sm font-mono font-medium text-gray-800 placeholder-gray-400 placeholder:font-sans focus:outline-none tracking-wider"
                  />
                </div>
              </Field>

              {/* Description */}
              <Field label="Payment Reference (Optional)">
                <div className="flex items-start rounded-2xl border-2 border-gray-200 bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-indigo-100 transition-all duration-200">
                  <FileText className="w-5 h-5 text-gray-400 mt-4 ml-4 flex-shrink-0" />
                  <textarea
                    value={form.description}
                    onChange={e => handleFormChange('description', e.target.value)}
                    placeholder="Invoice number, note, or reference…"
                    rows={2} maxLength={200}
                    className="flex-1 pl-3 pr-4 py-4 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                  />
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 2: Confirm + PIN ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Transfer summary card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white">
                <p className="text-white/60 text-xs mb-1">Transfer Amount</p>
                <p className="text-4xl font-black mb-4">
                  {bank
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: bank.currency, minimumFractionDigits: 2 }).format(parseAmount(form.amount))
                    : `$${formatAmount(form.amount)}`}
                </p>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">To</span>
                    <span className="text-white font-semibold text-sm">{form.recipientName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Account</span>
                    <span className="text-white font-mono text-sm tracking-wider">{form.recipientAccount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Bank</span>
                    <span className="text-white text-sm flex items-center gap-1.5">
                      <span>{bank?.flag}</span>
                      <span className="font-medium">{bank?.bankName}</span>
                    </span>
                  </div>
                  {form.description && (
                    <div className="flex justify-between items-start">
                      <span className="text-white/60 text-xs">Ref</span>
                      <span className="text-white/80 text-xs text-right max-w-[60%]">{form.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Transaction PIN */}
              <Field label="Transaction PIN" error={errors.transactionPin} touched={touched.transactionPin}>
                <div className={`flex items-center rounded-2xl border-2 transition-all duration-200
                  ${touched.transactionPin && errors.transactionPin
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-indigo-100'}`}>
                  <Lock className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={form.transactionPin}
                    onChange={e => handleFormChange('transactionPin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onBlur={() => touch('transactionPin')}
                    placeholder="Enter your 4–6 digit PIN"
                    maxLength={6}
                    className="flex-1 pl-3 pr-4 py-4 bg-transparent text-lg font-mono tracking-[0.4em] text-gray-800 placeholder:text-sm placeholder:tracking-normal placeholder-gray-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPin(v => !v)}
                    className="mr-4 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 ml-1">
                  Set your PIN in More → Security if not yet configured.
                </p>
              </Field>
            </div>
          )}

          <div className="h-3" />
        </div>

        {/* ── Footer: Navigation buttons ── */}
        <div className="px-6 pb-8 pt-3 border-t border-gray-100 flex-shrink-0 space-y-2">
          {step < 2 ? (
            <button onClick={nextStep}
              className={`w-full py-4 font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg
                ${(step === 0 && !canProceedStep0) || (step === 1 && !canProceedStep1)
                  ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 hover:opacity-90 active:scale-95'}`}>
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl text-sm disabled:opacity-60 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              {loading
                ? <><RefreshCw className="w-5 h-5 animate-spin" />Processing Transfer…</>
                : <><ArrowRight className="w-5 h-5" />Confirm & Send Transfer</>
              }
            </button>
          )}
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
