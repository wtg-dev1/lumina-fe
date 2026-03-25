import React, { useState } from 'react'
import { C } from '../../utils/constants'
import { phqSev, gadSev } from '../../utils/helpers'
import { useStore } from '../../data/store'
import { Bar } from '../../components/ui'

export default function AssessmentsView() {
  const { state: db } = useStore()

  const [empFilter, setEmpFilter] = useState('all')

  const list = db.clients
    .filter(c => empFilter === 'all' || c.employerId === empFilter)
    .map(c => {
      const all = db.assessments
        .filter(a => a.clientId === c.id && a.completed === true && a.score !== null && a.score !== undefined)
        .sort((a, b) => a.date.localeCompare(b.date))
      return {
        ...c,
        phq:     all.filter(a => a.type === 'PHQ9'),
        gad:     all.filter(a => a.type === 'GAD7'),
        empName: db.employers.find(e => e.id === c.employerId)?.name,
      }
    })

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.textDark, margin:0 }}>Assessments</h2>
          <p style={{ fontSize:13, color:C.textMid, margin:'3px 0 0' }}>PHQ-9 &amp; GAD-7 · completed results</p>
        </div>
        <select value={empFilter} onChange={e => setEmpFilter(e.target.value)}
          style={{ border:`1px solid ${C.border}`, borderRadius:4, padding:'7px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', background:C.white, outline:'none' }}>
          <option value="all">All Employers</option>
          {db.employers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div style={{ display:'grid', gap:14 }}>
        {list.map(c => (
          <div key={c.id} style={{ ...card, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <span style={{ fontFamily:'monospace', color:C.teal, fontWeight:700 }}>{c.anonId}</span>
                {c.clientName && <span style={{ fontSize:12, fontWeight:600, color:C.textDark, marginLeft:10 }}>{c.clientName}</span>}
                <span style={{ fontSize:12, color:C.textMid, marginLeft:10 }}>{c.empName}</span>
              </div>
              <span style={{ fontSize:12, color:C.textMid }}>{c.phq.length + c.gad.length} completed</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                { key:'phq', data:c.phq, max:27, label:'PHQ-9 · Depression', color:C.teal,      sev:phqSev },
                { key:'gad', data:c.gad, max:21, label:'GAD-7 · Anxiety',    color:C.tealGreen, sev:gadSev },
              ].map(({ key, data, max, label, color, sev }) => (
                <div key={key} style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>{label}</div>
                  {data.length > 0 ? (
                    <>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8 }}>
                        <span style={{ color:C.textMid }}>Intake: <strong style={{ color:sev(data[0].score).c }}>{data[0].score} ({sev(data[0].score).l})</strong></span>
                        <span style={{ color:C.textMid }}>Latest: <strong style={{ color:sev(data[data.length - 1].score).c }}>{data[data.length - 1].score} ({sev(data[data.length - 1].score).l})</strong></span>
                      </div>
                      <Bar v={data[data.length - 1].score} max={max} color={data[data.length - 1].score < data[0].score ? color : '#C0392B'}/>
                      {data[0].score - data[data.length - 1].score >= 5 && (
                        <div style={{ marginTop:7, fontSize:11, color }}>✓ Clinically significant improvement (≥5pt)</div>
                      )}
                      <div style={{ marginTop:10 }}>
                        {data.map(a => (
                          <div key={a.id} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.textMid, marginBottom:3 }}>
                            <span style={{ fontFamily:'monospace' }}>{a.date}</span>
                            <strong style={{ color:sev(a.score).c }}>{a.score}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize:12, color:C.border }}>No completed assessments yet</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
