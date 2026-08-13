import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  Eye, EyeOff, Snowflake, Wifi, Lock, Settings,
  Plus, ChevronRight, ShieldCheck, RefreshCw, Copy, Check
} from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const CARDS_DATA = [
  {
    id: 'c1', type: 'physical', network: 'Visa',       name: 'Main Debit Card',
    last4: '4521', expiry: '08/28', cvv: '•••', limit: 5000, spent: 1840,
    frozen: false, color: 'from-indigo-600 via-indigo-700 to-violet-800',
  },
  {
    id: 'c2', type: 'virtual',  network: 'Mastercard', name: 'Online Shopping',
    last4: '9934', expiry: '12/27', cvv: '•••', limit: 1000, spent: 342,
    frozen: false, color: 'from-slate-700 via-slate-800 to-gray-900',
  },
  {
    id: 'c3', type: 'virtual',  network: 'Visa',       name: 'Subscription Card',
    last4: '1177', expiry: '03/26', cvv: '•••', limit: 500,  spent: 89,
    frozen: true,  color: 'from-violet-600 via-purple-700 to-fuchsia-800',
  },
]

const CARD_CONTROLS = [
  { icon: Wifi,        label: 'Contactless',     sub: 'Enabled',    toggle: true  },
  { icon: Lock,        label: 'Online Payments', sub: 'Enabled',    toggle: true  },
  { icon: RefreshCw,   label: 'ATM Withdrawals', sub: 'Enabled',    toggle: true  },
  { icon: ShieldCheck, label: '3D Secure',       sub: 'Active',     toggle: false },
]

function CardVisual({ card, reveal, onReveal }) {
  const used = (card.spent / card.limit) * 100

  return (
    <div className={`relative w-full aspect-[1.7] rounded-3xl bg-gradient-to-br ${card.color} p-5 shadow-2xl overflow-hidden select-none`}>
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-6 w-48 h-48 rounded-full bg-white/5" />

      {/* Frozen overlay */}
      {card.frozen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-2 z-10">
          <Snowflake className="w-10 h-10 text-sky-300" />
          <p className="text-white font-bold text-sm">Card Frozen</p>
        </div>
      )}

      <div className="relative z-0 flex flex-col h-full justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-widest">{card.type}</p>
            <p className="text-white font-bold text-sm mt-0.5">{card.name}</p>
          </div>
          <div className="text-white/80 font-bold text-sm italic">{card.network}</div>
        </div>

        {/* Middle — chip + number */}
        <div>
          <div className="w-8 h-5 rounded-sm bg-yellow-300/80 mb-3" />
          <p className="text-white font-mono text-sm tracking-widest">
            •••• •••• •••• {card.last4}
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/50 text-[9px] uppercase">Expires</p>
            <p className="text-white font-semibold text-xs">{card.expiry}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[9px] uppercase">CVV</p>
            <div className="flex items-center gap-1">
              <p className="text-white font-semibold text-xs font-mono">
                {reveal ? '357' : card.cvv}
              </p>
              <button onClick={onReveal} className="text-white/60 hover:text-white">
                {reveal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
          {/* Limit bar */}
          <div className="text-right">
            <p className="text-white/50 text-[9px] uppercase">Spent</p>
            <p className="text-white font-semibold text-xs">{fmt(card.spent)} / {fmt(card.limit)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Cards() {
  const { user } = useAuth()
  const [cards,         setCards]        = useState(CARDS_DATA)
  const [activeCard,    setActiveCard]   = useState(0)
  const [revealCvv,     setRevealCvv]    = useState(false)
  const [copied,        setCopied]       = useState(false)
  const [activeTab,     setActiveTab]    = useState('details')  // details | controls | settings

  const card = cards[activeCard]

  const toggleFreeze = () => {
    setCards(cs => cs.map((c, i) => i === activeCard ? { ...c, frozen: !c.frozen } : c))
  }

  const copyNumber = () => {
    navigator.clipboard?.writeText(`4000 0000 0000 ${card.last4}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const spentPct = Math.round((card.spent / card.limit) * 100)

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-5 pt-2 pb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-xl">My Cards</h2>
            <p className="text-white/60 text-xs">{cards.length} cards • {cards.filter(c => !c.frozen).length} active</p>
          </div>
          <button className="flex items-center gap-1.5 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-xl px-3 py-2 text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add Card
          </button>
        </div>

        {/* Card visual */}
        <CardVisual card={card} reveal={revealCvv} onReveal={() => setRevealCvv(v => !v)} />

        {/* Card selector dots */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((c, i) => (
            <button key={c.id} onClick={() => { setActiveCard(i); setRevealCvv(false) }}
              className={`transition-all rounded-full ${i === activeCard ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
      </div>

      <div className="bg-[#f0f4ff] px-4 pt-4 space-y-4">
        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: card.frozen ? 'Unfreeze' : 'Freeze', icon: Snowflake, action: toggleFreeze,
              color: card.frozen ? 'bg-sky-100 text-sky-600' : 'bg-blue-100 text-blue-600' },
            { label: 'Copy No.', icon: copied ? Check : Copy, action: copyNumber,
              color: copied ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600' },
            { label: 'Settings', icon: Settings, action: () => setActiveTab('settings'),
              color: 'bg-gray-100 text-gray-600' },
          ].map(({ label, icon: Icon, action, color }) => (
            <button key={label} onClick={action}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 shadow-sm hover:shadow-md active:scale-95 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">{label}</span>
            </button>
          ))}
        </div>

        {/* Spend limit */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-800">Spending Limit</span>
            <span className="text-xs text-gray-400">{spentPct}% used</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
            <div className={`h-2.5 rounded-full transition-all ${spentPct > 80 ? 'bg-red-500' : spentPct > 50 ? 'bg-amber-400' : 'bg-indigo-500'}`}
              style={{ width: `${spentPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Spent: {fmt(card.spent)}</span>
            <span>Limit: {fmt(card.limit)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm">
          {['details', 'controls', 'settings'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all
                ${activeTab === t ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2.5 text-sm">
            {[
              ['Card Type',    card.type],
              ['Network',      card.network],
              ['Card Name',    card.name],
              ['Last 4 digits',card.last4],
              ['Expiry',       card.expiry],
              ['Status',       card.frozen ? '❄️ Frozen' : '✅ Active'],
              ['Cardholder',   `${user?.first_name} ${user?.last_name}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">{k}</span>
                <span className="font-semibold text-gray-700 capitalize">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Controls tab */}
        {activeTab === 'controls' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-800">Card Controls</h3>
            {CARD_CONTROLS.map(({ icon: Icon, label, sub, toggle }) => (
              <div key={label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                {toggle ? (
                  <div className="w-10 h-5 bg-indigo-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                ) : (
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-800">Card Settings</h3>
            {['Change PIN', 'Report Lost or Stolen', 'Request Replacement', 'View Statements', 'Close Card'].map(item => (
              <button key={item}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow
                  ${item === 'Close Card' ? 'border border-red-100' : ''}`}>
                <span className={`text-sm font-medium ${item === 'Close Card' ? 'text-red-500' : 'text-gray-700'}`}>
                  {item}
                </span>
                <ChevronRight className={`w-4 h-4 ${item === 'Close Card' ? 'text-red-300' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  )
}
