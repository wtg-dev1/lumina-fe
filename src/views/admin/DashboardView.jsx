import React, { useEffect } from 'react'
import { C } from '../../utils/constants'
import { fmt, monthLabel } from '../../utils/helpers'
import { useCareStore, useFinanceStore, useOrgStore } from '../../data/stores'
import { SH, StatCard, Bar } from '../../components/ui'
import { Badge } from '../../components/ui'

export default function DashboardView({ onNavigate = () => {} }) {
  const org = useOrgStore()
  const care = useCareStore()
  const finance = useFinanceStore()
  const db = {
    employers: org.employers,
    practices: org.practices,
    sessions: care.sessions,
    referrals: care.referrals,
    invoices: finance.invoices,
    adminFees: finance.adminFees,
    payouts: finance.payouts,
  }

  useEffect(() => {
    org.ensureSummaryLoaded()
    care.ensureCoreLoaded()
    finance.ensureSummaryLoaded()
  }, [org.ensureSummaryLoaded, care.ensureCoreLoaded, finance.ensureSummaryLoaded])

  useEffect(() => {
    if (!org.employers.length) return
    finance.ensureAdminFeesLoaded({ employerIds: org.employers.map((e) => e.id) })
  }, [org.employers, finance.ensureAdminFeesLoaded])

  const now         = new Date()
  const isOverdue   = (i) => i.status === 'payment_failed' || (i.status === 'finalized' && i.due_date && new Date(i.due_date) < now)
  const totalRev    = db.invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.total_cents||0),0)
  const pendRev     = db.invoices.filter(i=>['finalized','draft'].includes(i.status)).reduce((s,i)=>s+(i.total_cents||0),0)
  const margin      = db.payouts.filter(p=>p.status==='paid').reduce((s,p)=>s+p.marginCents,0)
  const mtd         = db.sessions.filter(s=>s.date.startsWith('2026-03')).length
  const overdue     = db.invoices.filter(isOverdue)
  const pendPay     = db.payouts.filter(p=>['pending','processing'].includes(p.status))
  const pendRef     = (db.referrals||[]).filter(r=>r.status==='pending').length
  const adminPaid   = (db.adminFees||[]).filter(f=>f.status==='paid').reduce((s,f)=>s+f.feeCents,0)
  const adminOverdue= (db.adminFees||[]).filter(f=>f.status==='overdue')
  const adminSent   = (db.adminFees||[]).filter(f=>f.status==='sent')
  const totalSess   = db.sessions.length
  const byPrac      = db.practices.map(p=>({ name:p.name, rev:db.payouts.filter(x=>x.practiceId===p.id&&x.status==='paid').reduce((s,x)=>s+x.netCents,0) })).sort((a,b)=>b.rev-a.rev)
  const byType      = ['individual','couple','psychiatry'].map(t=>({ t, n:db.sessions.filter(s=>s.type===t).length }))

  const card = { background:C.white, border:`1px solid ${C.border}`, borderRadius:5 }

  return (
    <div>
      <SH title="Operations Dashboard" sub="Lumina Therapy Alliance · March 2026" />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
        <StatCard label="Session Revenue"  value={fmt(totalRev)}   sub="Paid invoices"     accent={C.teal} />
        <StatCard label="Admin Fees Paid"  value={fmt(adminPaid)}  sub="Annual fees YTD"   accent={C.tealGreen} />
        <StatCard label="Lumina Margin"    value={fmt(margin)}     sub="Retained YTD"      accent={C.tealMid} />
        <StatCard label="Sessions MTD"     value={mtd}             sub="March 2026"         accent={C.tealDark} />
      </div>

      {pendRef>0&&<div onClick={()=>onNavigate('/ops/admin/referrals')} style={{background:`${C.teal}0d`,border:`1px solid ${C.teal}40`,borderRadius:4,padding:'10px 14px',fontSize:13,color:C.teal,marginBottom:8,cursor:'pointer',fontWeight:600}}>
        📋 {pendRef} pending referral{pendRef>1?'s':''} awaiting practice match — <span style={{textDecoration:'underline'}}>view referrals →</span>
      </div>}

      {[...adminOverdue.map(f=>({ msg:<>⚠ Admin fee overdue — <strong>{db.employers.find(e=>e.id===f.employerId)?.name}</strong> · {f.periodLabel} · {fmt(f.feeCents)}</>, bg:'#FCE8E8',color:'#B03A3A',border:'#D9534F' })),
        ...adminSent.map(f=>({ msg:<>💰 Admin fee awaiting payment — <strong>{db.employers.find(e=>e.id===f.employerId)?.name}</strong> · {f.periodLabel} · {fmt(f.feeCents)} · Due {f.dueDate}</>, bg:'#FFF3E0',color:'#8B5E00',border:'#F0A500' })),
        ...overdue.map(inv=>({ msg:<>⚠ Session invoice overdue — <strong>{db.employers.find(e=>e.id===inv.employer_id)?.name}</strong> · {monthLabel(inv.period_start)} · {fmt(inv.total_cents||0)}</>, bg:'#FCE8E8',color:'#B03A3A',border:'#D9534F' })),
        ...pendPay.map(pay=>({ msg:<>⏳ Payout {pay.status} — <strong>{db.practices.find(p=>p.id===pay.practiceId)?.name}</strong> · {pay.period} · {fmt(pay.netCents)}</>, bg:'#FFF3E0',color:'#8B5E00',border:'#F0A500' }))
      ].map((a,i)=>(
        <div key={i} style={{ background:a.bg, border:`1px solid ${a.border}`, borderRadius:4, padding:'10px 14px', fontSize:13, color:a.color, marginBottom:8 }}>{a.msg}</div>
      ))}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
        <div style={{ ...card, padding:18 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>Net Revenue by Practice</div>
          {byPrac.map(p=>(
            <div key={p.name} style={{ marginBottom:11 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4, color:C.textDark }}>
                <span>{p.name}</span><span style={{ fontFamily:'monospace', fontWeight:700 }}>{fmt(p.rev)}</span>
              </div>
              <div style={{ background:C.cream, borderRadius:2, height:5, border:`1px solid ${C.border}` }}>
                <div style={{ width:`${byPrac[0].rev?(p.rev/byPrac[0].rev)*100:0}%`, height:'100%', background:C.teal, borderRadius:2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding:18 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>Sessions by Type</div>
          {byType.map(({t,n})=>(
            <div key={t} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:11 }}>
              <div style={{ width:76, fontSize:12, color:C.textDark, textTransform:'capitalize' }}>{t}</div>
              <div style={{ flex:1 }}><Bar v={n} max={totalSess} /></div>
            </div>
          ))}
          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', fontSize:12, color:C.textMid }}>
            <span>Total sessions</span><span style={{ fontFamily:'monospace', fontWeight:700, color:C.textDark }}>{totalSess}</span>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, background:C.cream }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em' }}>Employer Summary</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>{[['Employer'],['Billing'],['Sessions',true],['Revenue',true],['Latest Invoice']].map(([h,r],i)=><th key={i} style={{padding:'9px 14px',fontSize:10,fontWeight:700,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.06em',borderBottom:`1px solid ${C.border}`,background:C.cream,whiteSpace:'nowrap',textAlign:r?'right':'left'}}>{h}</th>)}</tr></thead>
          <tbody>{db.employers.map(emp=>{
            const sessions = db.sessions.filter(s=>s.employerId===emp.id).length
            const revenue  = db.invoices.filter(i=>i.employer_id===emp.id&&i.status==='paid').reduce((s,i)=>s+(i.total_cents||0),0)
            const inv = db.invoices.filter(i=>i.employer_id===emp.id).sort((a,b)=>(b.period_start||'').localeCompare(a.period_start||''))[0]
            const td = (right=false) => ({ padding:'10px 14px', textAlign:right?'right':'left', color:C.textDark, borderBottom:`1px solid ${C.border}`, verticalAlign:'middle' })
            return <tr key={emp.id}>
              <td style={td()}><strong>{emp.name}</strong></td>
              <td style={{...td(),color:C.textMid,textTransform:'capitalize'}}>{emp.billing}</td>
              <td style={{...td(true),fontFamily:'monospace'}}>{sessions}</td>
              <td style={{...td(true),fontFamily:'monospace',color:C.tealDark,fontWeight:700}}>{fmt(revenue)}</td>
              <td style={td()}>{inv?<Badge status={inv.status}/>:'—'}</td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>
  )
}
