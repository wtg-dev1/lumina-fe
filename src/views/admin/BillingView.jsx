import React, { useEffect, useState } from 'react'
import { C } from '../../utils/constants'
import { fmt, fmtFull, monthLabel, mapApiError, today } from '../../utils/helpers'
import { useFinanceStore, useOrgStore } from '../../data/stores'
import { SH, StatCard, Badge, Btn, Modal, Inp } from '../../components/ui'

const KIND_LABELS = {
  admin_fee_annual:      'Annual admin fee',
  pre_paid_monthly:      'Pre-paid monthly',
  pay_as_you_go_monthly: 'Pay-as-you-go',
}

const isOutstanding = (i) =>
  i.status === 'finalized' || i.status === 'payment_failed'

const isOverdue = (i, now) => {
  if (i.status === 'payment_failed') return true
  if (i.status !== 'finalized') return false
  if (!i.due_date) return false
  return new Date(i.due_date) < now
}

export default function BillingView() {
  const org = useOrgStore()
  const finance = useFinanceStore()
  const [detailId, setDetailId]   = useState(null)
  const [runOpen, setRunOpen]     = useState(false)
  const [runDate, setRunDate]     = useState('')
  const [runBusy, setRunBusy]     = useState(false)
  const [runError, setRunError]   = useState('')
  const [runReport, setRunReport] = useState(null)

  useEffect(() => {
    org.ensureSummaryLoaded()
    finance.ensureSummaryLoaded()
  }, [org.ensureSummaryLoaded, finance.ensureSummaryLoaded])

  const employers = org.employers || []
  const invoices  = finance.invoices || []
  const now       = new Date()

  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total_cents || 0), 0)
  const pend = invoices.filter(i => i.status === 'finalized').reduce((s, i) => s + (i.total_cents || 0), 0)
  const over = invoices.filter(i => isOverdue(i, now)).reduce((s, i) => s + (i.total_cents || 0), 0)

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  const submitRun = async () => {
    setRunBusy(true)
    setRunError('')
    setRunReport(null)
    try {
      const report = await finance.runInvoicing(runDate ? { forDate: runDate } : {})
      setRunReport(report)
    } catch (e) {
      setRunError(mapApiError(e, { notFound: 'Invoicing endpoint not found.' }).message)
    } finally {
      setRunBusy(false)
    }
  }

  const closeRun = () => {
    setRunOpen(false)
    setRunDate('')
    setRunError('')
    setRunReport(null)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <SH title="Billing" sub="Employer invoices · synced from Stripe"/>
        <Btn variant="ghost" small onClick={() => setRunOpen(true)}>Run invoicing</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:22 }}>
        <StatCard label="Collected" value={fmt(paid)} accent={C.tealGreen}/>
        <StatCard label="Pending"   value={fmt(pend)} accent={C.tealMid}/>
        <StatCard label="Overdue"   value={fmt(over)} accent="#C0392B"/>
      </div>

      <div style={{ display:'grid', gap:14 }}>
        {employers.map(emp => {
          const invs = invoices
            .filter(i => i.employer_id === emp.id)
            .sort((a, b) => (b.period_start || '').localeCompare(a.period_start || ''))

          return (
            <div key={emp.id} style={card}>
              <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, background:C.cream, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{emp.name}</span>
                <span style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', fontWeight:700 }}>{emp.billing_method || emp.billing}</span>
              </div>
              {invs.length === 0 ? (
                <div style={{ padding:'14px', fontSize:12, color:C.textMid, fontStyle:'italic' }}>No invoices yet.</div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <tbody>
                    {invs.map((inv, i) => (
                      <tr key={inv.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white, borderBottom:`1px solid ${C.border}` }}>
                        <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:C.textMid, whiteSpace:'nowrap' }}>{monthLabel(inv.period_start)}</td>
                        <td style={{ padding:'10px 14px', fontSize:11, color:C.textMid }}>{KIND_LABELS[inv.kind] || inv.kind}</td>
                        <td style={{ padding:'10px 14px', fontFamily:'monospace', fontWeight:700, color:C.textDark, textAlign:'right' }}>{fmt(inv.total_cents || 0)}</td>
                        <td style={{ padding:'10px 14px' }}><Badge status={inv.status}/></td>
                        <td style={{ padding:'10px 14px', textAlign:'right', whiteSpace:'nowrap' }}>
                          <Btn variant="ghost" small onClick={() => setDetailId(inv.id)}>View</Btn>
                          {inv.hosted_invoice_url && (
                            <a
                              href={inv.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginLeft:6, fontSize:11, color:C.teal, textDecoration:'underline' }}
                            >
                              Stripe ↗
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>

      {runOpen && (
        <Modal title="Run invoicing" onClose={closeRun}>
          <div style={{ fontSize:12, color:C.textMid, marginBottom:10 }}>
            Triggers the same generator as the daily cron. Leave the date blank to run for today (UTC).
          </div>
          <Inp
            label="For date (optional)"
            type="date"
            value={runDate}
            onChange={(e) => setRunDate(e.target.value)}
            placeholder={today()}
          />
          {runError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', color:'#B03A3A', borderRadius:4, padding:'8px 10px', fontSize:12, marginBottom:10 }}>
              {runError}
            </div>
          )}
          {runReport && (
            <div style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:'10px 12px', marginBottom:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:8 }}>
                {[['Generated', runReport.generated, C.tealGreen],
                  ['Skipped',   runReport.skipped,   C.textMid],
                  ['Errors',    runReport.errors,    runReport.errors > 0 ? '#B03A3A' : C.textMid]].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em' }}>{l}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:c, fontFamily:'monospace' }}>{v ?? 0}</div>
                  </div>
                ))}
              </div>
              {Array.isArray(runReport.messages) && runReport.messages.length > 0 && (
                <details>
                  <summary style={{ cursor:'pointer', fontSize:11, color:C.textMid, fontWeight:600 }}>
                    Messages ({runReport.messages.length})
                  </summary>
                  <ul style={{ margin:'6px 0 0 16px', padding:0, fontSize:11, color:C.textMid, fontFamily:'monospace' }}>
                    {runReport.messages.map((m, i) => <li key={i} style={{ marginBottom:3 }}>{m}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn variant="ghost" small onClick={closeRun}>{runReport ? 'Close' : 'Cancel'}</Btn>
            <Btn small onClick={submitRun} disabled={runBusy}>{runBusy ? 'Running…' : 'Run'}</Btn>
          </div>
        </Modal>
      )}

      {detailId && (
        <InvoiceDetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  )
}

function InvoiceDetailModal({ id, onClose }) {
  const finance = useFinanceStore()
  const [invoice, setInvoice] = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    finance.getInvoice(id)
      .then((data) => { if (alive) setInvoice(data) })
      .catch((e) => { if (alive) setError(mapApiError(e, { notFound: 'Invoice not found.' }).message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id, finance])

  return (
    <Modal title="Invoice details" onClose={onClose} maxWidth={640}>
      {loading && <div style={{ fontSize:12, color:C.textMid }}>Loading…</div>}
      {error && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', color:'#B03A3A', borderRadius:4, padding:'8px 10px', fontSize:12 }}>
          {error}
        </div>
      )}
      {invoice && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:14 }}>
            <Field label="Kind"   value={KIND_LABELS[invoice.kind] || invoice.kind} mono={false}/>
            <Field label="Status" value={<Badge status={invoice.status}/>} mono={false}/>
            <Field label="Period" value={`${monthLabel(invoice.period_start)} → ${monthLabel(invoice.period_end)}`}/>
            <Field label="Total"  value={fmtFull(invoice.total_cents || 0)} accent={C.tealDark}/>
            <Field label="Due"    value={invoice.due_date ? invoice.due_date.slice(0, 10) : '—'}/>
            <Field label="Paid"   value={invoice.paid_at ? invoice.paid_at.slice(0, 10) : '—'}/>
          </div>

          {invoice.hosted_invoice_url && (
            <div style={{ marginBottom:14 }}>
              <a
                href={invoice.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize:12, color:C.teal, textDecoration:'underline', fontWeight:600 }}
              >
                Open hosted invoice in Stripe ↗
              </a>
            </div>
          )}

          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>
            Line items
          </div>
          <div style={{ border:`1px solid ${C.border}`, borderRadius:4, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.cream }}>
                  {[['Product'], ['Description'], ['Qty', true], ['Unit', true], ['Total', true]].map(([h, r], i) => (
                    <th key={i} style={{ padding:'8px 10px', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', textAlign: r ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((it, i) => (
                  <tr key={it.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white, borderTop:`1px solid ${C.border}` }}>
                    <td style={{ padding:'8px 10px', fontSize:11, color:C.textDark }}>{it.product_key}</td>
                    <td style={{ padding:'8px 10px', fontSize:11, color:C.textMid }}>{it.description}</td>
                    <td style={{ padding:'8px 10px', fontSize:11, fontFamily:'monospace', textAlign:'right' }}>{it.quantity}</td>
                    <td style={{ padding:'8px 10px', fontSize:11, fontFamily:'monospace', textAlign:'right' }}>{fmtFull(it.unit_amount_cents || 0)}</td>
                    <td style={{ padding:'8px 10px', fontSize:11, fontFamily:'monospace', textAlign:'right', fontWeight:700, color:C.tealDark }}>{fmtFull(it.total_cents || 0)}</td>
                  </tr>
                ))}
                {(!invoice.items || invoice.items.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ padding:'10px', fontSize:11, color:C.textMid, fontStyle:'italic' }}>No line items.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Field({ label, value, mono = true, accent }) {
  return (
    <div>
      <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:700, color:accent || C.textDark, fontFamily: mono ? 'monospace' : 'Arial,sans-serif' }}>{value}</div>
    </div>
  )
}
