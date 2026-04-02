import React, { useEffect, useState } from 'react'
import { C } from '../../utils/constants'
import { fmt, phqSev, gadSev } from '../../utils/helpers'
import { useCareStore, useFinanceStore, useOrgStore } from '../../data/stores'
import { Badge } from '../../components/ui'
import { TH, TD } from '../../components/ui'

export default function EmployerPortalView({ employerId }) {
  const org = useOrgStore()
  const care = useCareStore()
  const finance = useFinanceStore()
  const db = {
    employers: org.employers,
    clients: care.clients,
    sessions: care.sessions,
    assessments: care.assessments,
    invoices: finance.invoices,
    adminFees: finance.adminFees,
  }

  useEffect(() => {
    org.ensureSummaryLoaded()
    care.ensureCoreLoaded()
    care.ensureAssessmentsLoaded()
    finance.ensureSummaryLoaded()
    finance.ensureAdminFeesLoaded({ employerIds: [employerId] })
  }, [
    org.ensureSummaryLoaded,
    care.ensureCoreLoaded,
    care.ensureAssessmentsLoaded,
    finance.ensureSummaryLoaded,
    finance.ensureAdminFeesLoaded,
    employerId,
  ])

  const [tab, setTab] = useState('invoices')

  const emp = db.employers.find(e => e.id === employerId)
  if (!emp) return <div style={{ color:C.textMid, padding:20 }}>Employer not found.</div>

  const sessionInvoices = db.invoices.filter(i => i.employerId === employerId).sort((a, b) => b.period.localeCompare(a.period))
  const adminFeeInvs    = (db.adminFees || []).filter(f => f.employerId === employerId).sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate))
  const empClients      = db.clients.filter(c => c.employerId === employerId)
  const empSessions     = db.sessions.filter(s => s.employerId === employerId)
  const empAssessments  = db.assessments.filter(a =>
    empClients.some(c => c.id === a.clientId) && a.completed === true && a.score !== null && a.score !== undefined
  )

  const totalOwed = [...sessionInvoices, ...adminFeeInvs].filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.totalCents || i.feeCents || 0), 0)
  const totalPaid = [...sessionInvoices, ...adminFeeInvs].filter(i => i.status === 'paid').reduce((s, i) => s + (i.totalCents || i.feeCents || 0), 0)

  const firstLast = (type) => {
    const m = {}
    empAssessments.filter(a => a.type === type && a.completed).forEach(a => {
      if (!m[a.clientId]) m[a.clientId] = { f:a, l:a }
      else {
        if (a.date < m[a.clientId].f.date) m[a.clientId].f = a
        if (a.date > m[a.clientId].l.date) m[a.clientId].l = a
      }
    })
    return m
  }

  const phq = firstLast('PHQ9')
  const gad = firstLast('GAD7')
  const avg = (vs) => vs.length ? (vs.reduce((s, v) => s + v, 0) / vs.length).toFixed(1) : '—'
  const pct = (m) => {
    const ids = Object.keys(m)
    if (!ids.length) return '—'
    const n = ids.filter(id => m[id].f.score - m[id].l.score >= 5).length
    return `${Math.round((n / ids.length) * 100)}%`
  }

  const phqI = avg(Object.values(phq).map(d => d.f.score))
  const phqL = avg(Object.values(phq).map(d => d.l.score))
  const gadI = avg(Object.values(gad).map(d => d.f.score))
  const gadL = avg(Object.values(gad).map(d => d.l.score))

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }
  const TABS = [['invoices', 'Invoices'], ['roi', 'Wellness Report'], ['utilization', 'Utilization']]

  return (
    <div>
      <div style={{ ...card, overflow:'hidden', marginBottom:20 }}>
        <div style={{ background:C.tealDark, padding:'18px 22px' }}>
          <div style={{ fontSize:10, color:'#A8D5D5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Employer Portal</div>
          <div style={{ fontSize:18, fontWeight:700, color:C.white }}>{emp.name}</div>
          <div style={{ fontSize:12, color:'#A8D5D5', marginTop:3 }}>{emp.contact} · {emp.email}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
          {[['Total Paid', fmt(totalPaid)], ['Currently Owed', fmt(totalOwed)], ['Employees Enrolled', empClients.length], ['Sessions Used', empSessions.length]].map(([l, v], i) => (
            <div key={l} style={{ padding:'13px 16px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:700, color:l === 'Currently Owed' && totalOwed > 0 ? '#D4721A' : C.tealDark, fontFamily:'monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:18 }}>
        {TABS.map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:tab === v ? 700 : 500, cursor:'pointer', background:tab === v ? C.teal : C.white, color:tab === v ? C.white : C.textMid, border:`1px solid ${tab === v ? C.teal : C.border}` }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Invoices tab ── */}
      {tab === 'invoices' && (
        <div>
          {totalOwed > 0 && (
            <div style={{ background:'#FFF3E0', border:'1px solid #F0A500', borderRadius:4, padding:'10px 14px', fontSize:13, color:'#8B5E00', marginBottom:14, fontWeight:600 }}>
              💰 You have {fmt(totalOwed)} currently outstanding. Please remit payment at your earliest convenience.
            </div>
          )}
          <h3 style={{ fontSize:13, fontWeight:700, color:C.textDark, marginBottom:10 }}>Monthly Session Invoices</h3>
          <div style={card}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.cream }}>
                  {[['Period'], ['Amount', true], ['Status'], ['Due Date']].map(([h, r], i) => (
                    <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessionInvoices.map((inv, i) => (
                  <tr key={inv.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white, borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ ...TD(false), fontFamily:'monospace' }}>{inv.period}</td>
                    <td style={{ ...TD(true),  fontFamily:'monospace', fontWeight:700, color:C.tealDark }}>{fmt(inv.totalCents)}</td>
                    <td style={TD(false)}><Badge status={inv.status}/></td>
                    <td style={{ ...TD(false), color:C.textMid, fontSize:12 }}>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize:13, fontWeight:700, color:C.textDark, margin:'20px 0 10px' }}>Annual Administrative Fee Invoices</h3>
          <div style={card}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:C.cream }}>
                  {[['Period'], ['Amount', true], ['Status'], ['Due Date'], ['Paid Date']].map(([h, r], i) => (
                    <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminFeeInvs.map((f, i) => (
                  <tr key={f.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white, borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ ...TD(false), fontSize:12 }}>{f.periodLabel}</td>
                    <td style={{ ...TD(true),  fontFamily:'monospace', fontWeight:700, color:C.tealDark }}>{fmt(f.feeCents)}</td>
                    <td style={TD(false)}><Badge status={f.status}/></td>
                    <td style={{ ...TD(false), fontFamily:'monospace', fontSize:12, color:C.textMid }}>{f.dueDate || '—'}</td>
                    <td style={{ ...TD(false), fontFamily:'monospace', fontSize:12, color:C.tealGreen }}>{f.paidDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:14, fontSize:11, color:C.textMid }}>
            Questions about your invoices? Contact Lumina Therapy Alliance at drselling@luminatherapyalliance.com or (718) 757-7033.
          </div>
        </div>
      )}

      {/* ── Wellness / ROI tab ── */}
      {tab === 'roi' && (
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ background:C.tealDark, padding:'20px 24px' }}>
            <div style={{ fontSize:10, color:C.tealMid, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:5, fontWeight:700 }}>Lumina Therapy Alliance</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.white }}>{emp.name}</div>
            <div style={{ fontSize:12, color:'#A8D5D5', marginTop:3 }}>Employee Wellness Report · March 2026</div>
            <div style={{ fontSize:11, color:'#7ABCBC', marginTop:5 }}>All data de-identified · HIPAA compliant · aggregate only · no individual names disclosed</div>
          </div>
          <div style={{ padding:22 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:22 }}>
              {[
                { label:'PHQ-9 · Depression', i:phqI, l:phqL, p:pct(phq), color:C.teal },
                { label:'GAD-7 · Anxiety',    i:gadI, l:gadL, p:pct(gad), color:C.tealGreen },
              ].map(({ label, i, l, p, color }) => (
                <div key={label} style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:4, padding:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textDark, marginBottom:12 }}>{label}</div>
                  {[['Avg intake score', i], ['Avg current score', l], ['Clinically improved (≥5pt)', p]].map(([lbl, val]) => (
                    <div key={lbl} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ color:C.textMid }}>{lbl}</span>
                      <strong style={{ color, fontFamily:'monospace' }}>{val}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.textMid, borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
              All data is de-identified and reported in aggregate only, in compliance with HIPAA. No individual employee names or identifying information is disclosed in this report.
            </div>
          </div>
        </div>
      )}

      {/* ── Utilization tab ── */}
      {tab === 'utilization' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
            {[
              ['Employees Enrolled',        empClients.length,                                                    C.teal],
              ['Total Sessions',            empSessions.length,                                                   C.tealDark],
              ['Avg Sessions/Employee',     empClients.length ? (empSessions.length / empClients.length).toFixed(1) : '—', C.tealGreen],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:'16px 18px', borderTop:`3px solid ${c}` }}>
                <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>{l}</div>
                <div style={{ fontSize:22, fontWeight:700, color:C.textDark, fontFamily:'monospace' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card, padding:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Sessions by Type</div>
            {['individual', 'couple', 'psychiatry'].map(t => {
              const n = empSessions.filter(s => s.type === t).length
              return (
                <div key={t} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:80, fontSize:12, color:C.textDark, textTransform:'capitalize' }}>{t}</div>
                  <div style={{ flex:1, background:C.cream, borderRadius:2, height:6, border:`1px solid ${C.border}` }}>
                    <div style={{ width:`${empSessions.length ? (n / empSessions.length) * 100 : 0}%`, height:'100%', background:C.teal, borderRadius:2 }}/>
                  </div>
                  <span style={{ fontSize:11, fontFamily:'monospace', color:C.textDark, minWidth:20 }}>{n}</span>
                </div>
              )
            })}
            <div style={{ marginTop:14, fontSize:11, color:C.textMid, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
              Session breakdown by modality — In-Person: <strong>{empSessions.filter(s => s.modality === 'in-person').length}</strong> · Virtual: <strong>{empSessions.filter(s => s.modality === 'virtual').length}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
