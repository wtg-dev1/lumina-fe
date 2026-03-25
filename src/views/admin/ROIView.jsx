import React, { useState } from 'react'
import { C } from '../../utils/constants'
import { fmt, phqSev, gadSev } from '../../utils/helpers'
import { useStore } from '../../data/store'

export default function ROIView() {
  const { state: db } = useStore()

  const [sel, setSel] = useState(db.employers[0]?.id)

  const emp = db.employers.find(e => e.id === sel)
  const ec  = db.clients.filter(c => c.employerId === sel)
  const es  = db.sessions.filter(s => s.employerId === sel)
  const ea  = db.assessments.filter(a =>
    ec.some(c => c.id === a.clientId) && a.completed === true && a.score !== null && a.score !== undefined
  )

  const firstLast = (type) => {
    const m = {}
    ea.filter(a => a.type === type).forEach(a => {
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

  const byPrac = db.practices.map(p => ({ name:p.name, n:es.filter(s => s.practiceId === p.id).length })).filter(p => p.n > 0)
  const byType = ['individual', 'couple', 'psychiatry'].map(t => ({ t, n:es.filter(s => s.type === t).length })).filter(t => t.n > 0)

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.textDark, margin:0 }}>ROI Reports</h2>
          <p style={{ fontSize:13, color:C.textMid, margin:'3px 0 0' }}>De-identified aggregate · HIPAA compliant</p>
        </div>
        <select value={sel} onChange={e => setSel(e.target.value)}
          style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'7px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', background:C.white, outline:'none' }}>
          {db.employers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div style={card}>
        <div style={{ background:C.tealDark, padding:'22px 26px' }}>
          <div style={{ fontSize:10, color:C.tealMid, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:5, fontWeight:700 }}>Lumina Therapy Alliance</div>
          <div style={{ fontSize:20, fontWeight:700, color:C.white }}>{emp?.name}</div>
          <div style={{ fontSize:13, color:'#A8D5D5', marginTop:3 }}>Employee Wellness Report · March 2026</div>
          <div style={{ fontSize:11, color:'#7ABCBC', marginTop:6 }}>All data de-identified · HIPAA compliant · aggregate only</div>
        </div>

        <div style={{ padding:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:`2px solid ${C.teal}`, paddingBottom:7, marginBottom:16, display:'inline-block' }}>Program Utilization</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
            {[
              ['Employees Engaged',          ec.length,                                       C.teal],
              ['Total Sessions',             es.length,                                       C.tealDark],
              ['Avg Sessions / Employee',    ec.length ? (es.length / ec.length).toFixed(1) : '—', C.tealGreen],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:4, padding:14, textAlign:'center' }}>
                <div style={{ fontSize:26, fontWeight:700, color:c, fontFamily:'monospace' }}>{v}</div>
                <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:`2px solid ${C.teal}`, paddingBottom:7, marginBottom:16, display:'inline-block' }}>Clinical Outcomes</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
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
                {i !== '—' && l !== '—' && (
                  <div style={{ marginTop:4 }}>
                    <div style={{ fontSize:10, color:C.textMid, marginBottom:4 }}>Avg improvement</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, background:C.border, borderRadius:2, height:5 }}>
                        <div style={{ width:`${Math.max(0, ((i - l) / i) * 100)}%`, height:'100%', background:color, borderRadius:2 }}/>
                      </div>
                      <span style={{ fontSize:12, color, fontFamily:'monospace', fontWeight:700 }}>−{(i - l).toFixed(1)} pts</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:20 }}>
            {[
              { title:'Sessions by Practice', rows:byPrac.map(p => [p.name, `${p.n} sessions`]) },
              { title:'Sessions by Type',     rows:byType.map(t => [t.t, `${t.n} sessions`]), cap:true },
              { title:'Sessions by Modality', rows:[
                ['🏢 In-Person', `${es.filter(s => s.modality === 'in-person').length} sessions`],
                ['💻 Virtual',   `${es.filter(s => s.modality === 'virtual').length} sessions`],
              ]},
            ].map(({ title, rows, cap }) => (
              <div key={title}>
                <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>{title}</div>
                {rows.map(([l, v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6, paddingBottom:6, borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ color:C.textMid, textTransform: cap ? 'capitalize' : 'none' }}>{l}</span>
                    <span style={{ fontFamily:'monospace', fontWeight:700, color:C.textDark }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ paddingTop:16, borderTop:`1px solid ${C.border}`, fontSize:11, color:C.textMid, lineHeight:1.7 }}>
            All data is de-identified and reported in aggregate only, in compliance with HIPAA. No individual employee data is disclosed. This report is generated automatically and transmitted securely to authorized employer contacts only.
          </div>
        </div>
      </div>
    </div>
  )
}
