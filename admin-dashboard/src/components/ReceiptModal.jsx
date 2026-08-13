import { useRef } from 'react'
import { X, Download, Printer, Share2, CheckCircle, Copy } from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmtCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency,
      minimumFractionDigits: 2,
    }).format(amount ?? 0)
  } catch {
    return `${currency} ${parseFloat(amount ?? 0).toFixed(2)}`
  }
}

const fmtDateTime = (dt) => {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const maskAccount = (acct) => {
  if (!acct || acct.length < 4) return acct || '—'
  return '*'.repeat(acct.length - 4) + acct.slice(-4)
}

/* ─── Row component ───────────────────────────────────────────────────────── */
function Row({ label, value, mono, highlight }) {
  return (
    <div className={`flex justify-between items-start py-2 border-b border-gray-50 last:border-0 ${highlight ? 'py-3' : ''}`}>
      <span className="text-xs text-gray-400 flex-shrink-0 w-32">{label}</span>
      <span className={`text-xs text-right flex-1 ml-2 break-all
        ${mono ? 'font-mono' : 'font-medium'}
        ${highlight ? 'text-indigo-700 font-bold text-sm' : 'text-gray-700'}
      `}>{value || '—'}</span>
    </div>
  )
}

/* ─── Main ReceiptModal ───────────────────────────────────────────────────── */
export default function ReceiptModal({ receipt, onClose }) {
  const printRef = useRef(null)

  if (!receipt) return null

  const {
    receiptId,
    transactionId,
    reference,
    status,
    dateTime,
    sender,
    recipient,
    amount,
    currency,
    description,
    processingStatus,
    authorizedBy,
  } = receipt

  /* ── Print ─────────────────────────────────────────────────────────────── */
  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank', 'width=500,height=700')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ZentroPay Receipt — ${reference}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; background: #fff; }
          .receipt-header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 900; color: #4f46e5; }
          .badge { display: inline-block; margin: 8px auto; background: #d1fae5; color: #065f46; padding: 4px 14px; border-radius: 99px; font-size: 12px; font-weight: 700; }
          .divider { border: none; border-top: 1px dashed #e5e7eb; margin: 14px 0; }
          .section-title { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin: 10px 0 4px; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f9fafb; font-size: 12px; }
          .row-label { color: #6b7280; }
          .row-value { font-weight: 600; text-align: right; word-break: break-all; }
          .amount-row { background: #f0f4ff; border-radius: 8px; padding: 10px 12px; margin: 12px 0; text-align: center; }
          .amount-val { font-size: 26px; font-weight: 900; color: #4f46e5; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <div class="logo">💳 ZentroPay</div>
          <p style="font-size:11px; color:#6b7280; margin-top:2px;">BANK TRANSFER RECEIPT</p>
          <div class="badge">✓ ${status || 'Successful'}</div>
        </div>
        <hr class="divider" />
        <div class="amount-row">
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">Transfer Amount</div>
          <div class="amount-val">${fmtCurrency(amount, currency)}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;">${currency}</div>
        </div>
        <div class="section-title">Transaction Details</div>
        <div class="row"><span class="row-label">Transaction ID</span><span class="row-value" style="font-family:monospace;font-size:10px">${transactionId || '—'}</span></div>
        <div class="row"><span class="row-label">Reference</span><span class="row-value">${reference || '—'}</span></div>
        <div class="row"><span class="row-label">Date & Time</span><span class="row-value">${fmtDateTime(dateTime)}</span></div>
        <div class="row"><span class="row-label">Status</span><span class="row-value">${status || '—'}</span></div>
        <hr class="divider" />
        <div class="section-title">Sender</div>
        <div class="row"><span class="row-label">Name</span><span class="row-value">${sender?.name || '—'}</span></div>
        <div class="row"><span class="row-label">Account</span><span class="row-value">${sender?.accountNumber || '—'}</span></div>
        <hr class="divider" />
        <div class="section-title">Recipient</div>
        <div class="row"><span class="row-label">Name</span><span class="row-value">${recipient?.name || '—'}</span></div>
        <div class="row"><span class="row-label">Account</span><span class="row-value">${recipient?.accountNumber || '—'}</span></div>
        <div class="row"><span class="row-label">Bank</span><span class="row-value">${recipient?.bank || '—'}</span></div>
        <div class="row"><span class="row-label">Country</span><span class="row-value">${recipient?.country || '—'}</span></div>
        <hr class="divider" />
        <div class="row"><span class="row-label">Description</span><span class="row-value">${description || '—'}</span></div>
        <div class="row"><span class="row-label">Processing</span><span class="row-value">${processingStatus || 'Cleared'}</span></div>
        <div class="row"><span class="row-label">Authorized by</span><span class="row-value">${authorizedBy || 'ZentroPay Banking System'}</span></div>
        <div class="footer">
          <p>This is an official ZentroPay digital receipt.</p>
          <p>Receipt ID: ${receiptId || '—'}</p>
          <p>© ${new Date().getFullYear()} ZentroPay Banking System</p>
        </div>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  /* ── Download PDF (via print dialog with PDF save option) ──────────────── */
  const handleDownload = () => handlePrint()

  /* ── Copy reference to clipboard ──────────────────────────────────────── */
  const handleCopyRef = () => {
    navigator.clipboard?.writeText(reference || transactionId || '').catch(() => {})
  }

  /* ── Share via Web Share API ────────────────────────────────────────────── */
  const handleShare = async () => {
    const text = [
      `ZentroPay Transfer Receipt`,
      `Reference: ${reference}`,
      `Amount: ${fmtCurrency(amount, currency)}`,
      `To: ${recipient?.name} (${recipient?.bank})`,
      `Date: ${fmtDateTime(dateTime)}`,
      `Status: ${status}`,
    ].join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: 'ZentroPay Receipt', text })
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard?.writeText(text).then(() => alert('Receipt copied to clipboard!')).catch(() => {})
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 max-w-md mx-auto left-1/2 -translate-x-1/2"
      onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-lg">Transfer Receipt</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div ref={printRef} className="px-5 py-4 space-y-4">

          {/* ── Branding + Status ── */}
          <div className="flex flex-col items-center py-3">
            <div className="text-2xl mb-2">💳</div>
            <h3 className="text-xl font-black text-indigo-700 tracking-tight">ZentroPay</h3>
            <p className="text-xs text-gray-400 mb-3">Bank Transfer Receipt</p>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 font-bold text-sm">{status || 'Successful'}</span>
            </div>
          </div>

          {/* ── Amount ── */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-center">
            <p className="text-white/70 text-xs mb-1">Transfer Amount</p>
            <p className="text-white font-black text-3xl tracking-tight">{fmtCurrency(amount, currency)}</p>
            <p className="text-white/60 text-xs mt-1">{currency}</p>
          </div>

          {/* ── Transaction Details ── */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction Details</p>
            <Row label="Transaction ID" value={transactionId?.slice(0, 24) + '…'} mono />
            <Row label="Reference"      value={reference}   mono />
            <Row label="Date & Time"    value={fmtDateTime(dateTime)} />
            <Row label="Status"         value={status} highlight />
          </div>

          {/* ── Sender ── */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sender</p>
            <Row label="Name"    value={sender?.name} />
            <Row label="Account" value={sender?.accountNumber} mono />
          </div>

          {/* ── Recipient ── */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recipient</p>
            <Row label="Name"    value={recipient?.name} />
            <Row label="Account" value={recipient?.accountNumber} mono />
            <Row label="Bank"    value={recipient?.bank} />
            <Row label="Country" value={recipient?.country} />
          </div>

          {/* ── Additional ── */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Info</p>
            <Row label="Description"  value={description || 'Interbank Transfer'} />
            <Row label="Processing"   value={processingStatus || 'Cleared'} />
            <Row label="Authorized by" value={authorizedBy || 'ZentroPay Banking System'} />
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-2.5">
            <button onClick={handleCopyRef}
              className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              <Copy className="w-3.5 h-3.5" />
              Copy Ref
            </button>
            <span className="text-indigo-200">|</span>
            <span className="text-[10px] text-indigo-400 font-mono flex-1 truncate">{reference}</span>
          </div>

          <p className="text-center text-[10px] text-gray-300 pb-1">
            Receipt ID: {receiptId?.slice(0, 8)}… · © {new Date().getFullYear()} ZentroPay
          </p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 grid grid-cols-3 gap-2">
          <button onClick={handleDownload}
            className="flex flex-col items-center gap-1.5 py-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors">
            <Download className="w-5 h-5" />
            <span className="text-[10px] font-bold">Download</span>
          </button>
          <button onClick={handlePrint}
            className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-colors">
            <Printer className="w-5 h-5" />
            <span className="text-[10px] font-bold">Print</span>
          </button>
          <button onClick={handleShare}
            className="flex flex-col items-center gap-1.5 py-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] font-bold">Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
