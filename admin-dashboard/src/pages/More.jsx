import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usersAPI } from '../services/api'
import {
  User, Bell, Shield, Settings, FileText, HelpCircle,
  MessageSquare, LogOut, ChevronRight, Camera,
  Lock, Smartphone, Eye, EyeOff, Check, X,
  LifeBuoy, Phone, Mail, ExternalLink, Users, Star,
  Copy, Hash
} from 'lucide-react'
import SetPinModal from '../components/SetPinModal'

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: User,        label: 'Personal Information', sub: 'Name, email, phone',         color: 'bg-indigo-50 text-indigo-600', tab: 'profile'   },
      { icon: Bell,        label: 'Notifications',        sub: 'Push, email, SMS alerts',    color: 'bg-violet-50 text-violet-600', tab: 'notifs'    },
      { icon: Shield,      label: 'Security',             sub: '2FA, biometrics, PIN',       color: 'bg-red-50    text-red-500',    tab: 'security'  },
      { icon: Settings,    label: 'Preferences',          sub: 'Language, currency, theme',  color: 'bg-gray-100  text-gray-600',   tab: 'settings'  },
    ],
  },
  {
    title: 'Finance',
    items: [
      { icon: FileText,    label: 'Statements',           sub: 'Monthly & annual reports',   color: 'bg-emerald-50 text-emerald-600', tab: 'statements' },
      { icon: Star,        label: 'Rewards & Cashback',   sub: '1,240 points available',     color: 'bg-amber-50  text-amber-500',   tab: null },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: LifeBuoy,    label: 'Help Center',          sub: 'FAQs and guides',            color: 'bg-sky-50    text-sky-600',    tab: 'help'      },
      { icon: MessageSquare,label: 'Live Chat',           sub: 'Chat with us now',           color: 'bg-teal-50   text-teal-600',   tab: 'support'   },
      { icon: Phone,       label: 'Call Support',         sub: '+1 (800) 123-4567',          color: 'bg-green-50  text-green-600',  tab: null },
    ],
  },
]

function ProfileTab({ user }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: user?.first_name ?? '', lastName: user?.last_name ?? '', phone: user?.phone || '' })
  const [saved, setSaved] = useState(false)
  const [accountNumber, setAccountNumber] = useState(user?.account_number || '')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!accountNumber) {
      usersAPI.getProfile().then(r => setAccountNumber(r.data?.user?.account_number || '')).catch(() => {})
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard?.writeText(accountNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      await usersAPI.updateProfile({ firstName: form.firstName, lastName: form.lastName, phone: form.phone })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaved(false)
    }
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      {/* Avatar */}
      <div className="flex flex-col items-center py-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="mt-3 font-bold text-gray-800 text-lg">{user?.first_name} {user?.last_name}</p>
        <p className="text-gray-400 text-sm">{user?.email}</p>
        <span className="mt-1 px-3 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold capitalize">{user?.role}</span>
      </div>

      {/* Account Number Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Hash className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Account Number</p>
          <p className="text-white font-mono font-bold text-base tracking-widest">{accountNumber || '—'}</p>
        </div>
        <button onClick={handleCopy}
          className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0">
          {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 text-white" />}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm">
          <Check className="w-4 h-4" /> Profile updated successfully
        </div>
      )}

      <form onSubmit={save} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
          <button type="button" onClick={() => setEditing(v => !v)}
            className="text-xs text-indigo-600 font-semibold">{editing ? 'Cancel' : 'Edit'}</button>
        </div>
        {[
          { label: 'First Name', key: 'firstName', value: form.firstName },
          { label: 'Last Name',  key: 'lastName',  value: form.lastName },
          { label: 'Email',      key: 'email',      value: user?.email,   readonly: true },
          { label: 'Phone',      key: 'phone',      value: form.phone || '' },
        ].map(({ label, key, value, readonly }) => (
          <div key={key}>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</label>
            <input value={value} readOnly={!editing || readonly}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors
                ${!editing || readonly ? 'bg-gray-50 border-gray-100 text-gray-600 cursor-default' : 'bg-white border-indigo-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'}`} />
          </div>
        ))}
        {/* Account Number (read-only always) */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Account Number</label>
          <div className="relative">
            <input value={accountNumber || '—'} readOnly
              className="w-full px-3 py-2.5 rounded-xl text-sm border bg-gray-50 border-gray-100 text-gray-500 cursor-default font-mono tracking-widest" />
            <p className="text-[9px] text-gray-300 mt-0.5">Account number is system-generated and cannot be changed.</p>
          </div>
        </div>
        {editing && (
          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            Save Changes
          </button>
        )}
      </form>
      <div className="h-2" />
    </div>
  )
}

function SecurityTab() {
  const [twoFA, setTwoFA] = useState(true)
  const [biometric, setBiometric] = useState(false)
  const [txPin, setTxPin] = useState(true)
  const [showSetPin, setShowSetPin] = useState(false)

  return (
    <div className="space-y-4 px-4 pt-4">
      <h3 className="text-sm font-bold text-gray-800">Security Settings</h3>
      {[
        { label: 'Two-Factor Authentication', sub: 'Extra security on login', val: twoFA,     set: setTwoFA },
        { label: 'Biometric Login',           sub: 'Face ID / Fingerprint',   val: biometric, set: setBiometric },
        { label: 'Transaction PIN',           sub: 'Require PIN for payments', val: txPin,    set: setTxPin },
      ].map(({ label, sub, val, set }) => (
        <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
          <button onClick={() => set(v => !v)}
            className={`w-11 h-6 rounded-full relative transition-colors ${val ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${val ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      ))}

      {/* Set Transaction PIN Button */}
      <button onClick={() => setShowSetPin(true)}
        className="w-full bg-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:bg-indigo-700 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">Set / Change Transaction PIN</p>
            <p className="text-xs text-white/70">Required for interbank transfers</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/60" />
      </button>

      <div className="space-y-2">
        {['Change Password', 'View Login History', 'Trusted Devices', 'Freeze Account'].map(item => (
          <button key={item}
            className={`w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow
              ${item === 'Freeze Account' ? 'border border-red-100' : ''}`}>
            <span className={`text-sm font-medium ${item === 'Freeze Account' ? 'text-red-500' : 'text-gray-700'}`}>
              {item}
            </span>
            <ChevronRight className={`w-4 h-4 ${item === 'Freeze Account' ? 'text-red-300' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
      <div className="h-2" />

      {showSetPin && <SetPinModal onClose={() => setShowSetPin(false)} onSuccess={() => setShowSetPin(false)} />}
    </div>
  )
}

function StatementsTab() {
  const months = [
    { month: 'May 2026',   size: '245 KB', txs: 18 },
    { month: 'April 2026', size: '310 KB', txs: 24 },
    { month: 'March 2026', size: '198 KB', txs: 15 },
    { month: 'Feb 2026',   size: '275 KB', txs: 21 },
    { month: 'Jan 2026',   size: '220 KB', txs: 17 },
  ]
  return (
    <div className="space-y-3 px-4 pt-4">
      <h3 className="text-sm font-bold text-gray-800">Account Statements</h3>
      {months.map(({ month, size, txs }) => (
        <div key={month} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{month}</p>
            <p className="text-xs text-gray-400">{txs} transactions · {size}</p>
          </div>
          <button className="flex items-center gap-1 bg-indigo-50 text-indigo-600 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <ExternalLink className="w-3 h-3" /> PDF
          </button>
        </div>
      ))}
      <div className="h-2" />
    </div>
  )
}

function HelpTab() {
  const faqs = [
    { q: 'How do I transfer money?',          a: 'Go to Wallet → Transfer or use the "Send Money" quick action on the home screen.' },
    { q: 'How do I freeze my card?',           a: 'Navigate to Cards → select your card → tap the Freeze button.' },
    { q: 'What are the transaction limits?',   a: 'Daily transfer limit is $10,000. Monthly limit is $50,000 for verified accounts.' },
    { q: 'How do I enable two-factor auth?',   a: 'Go to More → Security → Enable Two-Factor Authentication.' },
    { q: 'Can I have multiple virtual cards?', a: 'Yes. Go to Cards → Add Card → Virtual Card to create up to 5 virtual cards.' },
  ]
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-3 px-4 pt-4">
      <h3 className="text-sm font-bold text-gray-800">Help Center — FAQs</h3>
      {faqs.map(({ q, a }, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left">
            <span className="text-sm font-medium text-gray-800">{q}</span>
            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform flex-shrink-0 ml-2 ${open === i ? 'rotate-90' : ''}`} />
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-2">
              {a}
            </div>
          )}
        </div>
      ))}

      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 flex items-center gap-3 mt-4">
        <MessageSquare className="w-8 h-8 text-white/80 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Still need help?</p>
          <p className="text-white/70 text-xs">Chat with our support team</p>
        </div>
        <button className="bg-white text-indigo-600 rounded-xl px-3 py-1.5 text-xs font-bold">
          Chat Now
        </button>
      </div>
      <div className="h-2" />
    </div>
  )
}

export default function More() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(null)  // null = menu list

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  /* Sub-page header */
  const tabTitles = { profile: 'Personal Info', notifs: 'Notifications', security: 'Security', settings: 'Preferences', statements: 'Statements', help: 'Help Center', support: 'Support' }

  if (activeTab) {
    return (
      <div className="space-y-0">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-2 pb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab(null)}
              className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-white font-bold text-lg">{tabTitles[activeTab]}</h2>
          </div>
        </div>
        <div className="bg-[#f0f4ff]">
          {activeTab === 'profile'    && <ProfileTab    user={user} />}
          {activeTab === 'security'   && <SecurityTab />}
          {activeTab === 'statements' && <StatementsTab />}
          {activeTab === 'help'       && <HelpTab />}
          {(activeTab === 'notifs' || activeTab === 'settings' || activeTab === 'support') && (
            <div className="px-4 pt-8 pb-4 text-center text-gray-400 text-sm">
              <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              This section is coming soon.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-2 pb-8">
        {/* Profile summary */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white font-bold text-lg uppercase">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{user?.first_name} {user?.last_name}</p>
            <p className="text-white/60 text-xs">{user?.email}</p>
            <span className="inline-block mt-1 bg-white/20 text-white/90 text-[10px] px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#f0f4ff] px-4 pt-4 space-y-4">
        {MENU_SECTIONS.map(({ title, items }) => (
          <div key={title}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{title}</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {items.map(({ icon: Icon, label, sub, color, tab }) => (
                <button key={label} onClick={() => tab && setActiveTab(tab)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Admin Users link (admin only) */}
        {user?.role === 'admin' && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Admin</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button onClick={() => navigate('/admin/users')}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-purple-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-700">User Management</p>
                  <p className="text-xs text-gray-400">Admin — view & manage all users</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5 hover:bg-red-100 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-bold text-red-600 flex-1 text-left">Sign Out</span>
          <ChevronRight className="w-4 h-4 text-red-300" />
        </button>

        <p className="text-center text-xs text-gray-300 pb-2">ZentroPay v1.0.0 — © {new Date().getFullYear()}</p>
        <div className="h-2" />
      </div>
    </div>
  )
}
