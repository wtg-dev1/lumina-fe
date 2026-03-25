import React, { useState } from 'react'
import { C } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { useStore } from '../../data/store'
import { SH, Btn, Sel, Modal, ModalityBadge } from '../../components/ui'
import { TH, TD } from '../../components/ui'

export default function SessionsView() {
  const { state: db, dispatch } = useStore()

  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({
    clientId:'', clinicianId:'', practiceId:'', employerId:'',
    date:'', type:'individual', modality:'in-person', feeCents:'',
  })

  const getRate = (practiceId, type) => {
    const p = db.practices.find(x => x.id === practiceId)
    if (!p) return ''
    const r = { individual: p.rateIndividual, couple: p.rateCouple, psychiatry: p.ratePsychiatry }[type]
    return r ? String(r / 100) : ''
  }

  const pickClient = (clientId) => {
    const c = db.clients.find(x => x.id === clientId)
    if (c) {
      const fee = getRate(c.practiceId, form.type)
      setForm(f => ({ ...f, clientId, clinicianId:c.clinicianId, practiceId:c.practiceId, employerId:c.employerId, modality:c.modality || 'in-person', feeCents:fee }))
    }
  }

  const changeType = (type) => {
    const fee = form.practiceId ? getRate(form.practiceId, type) : ''
    setForm(f => ({ ...f, type, feeCents:fee }))
  }

  const addSession = () => {
    dispatch({ type: 'ADD_SESSION', payload: {
      ...form,
      feeCents: Math.round(parseFloat(form.feeCents) * 100),
    }})
    setModal(false)
    setForm({ clientId:'', clinicianId:'', practiceId:'', employerId:'', date:'', type:'individual', modality:'in-person', feeCents:'' })
  }

  const sorted  = [...db.sessions].sort((a, b) => b.date.localeCompare(a.date))
  const prac     = db.practices.find(p => p.id === form.practiceId)
  const rateHint = prac ? `Practice rate: ${fmt(prac.rateIndividual || 0)} / ${fmt(prac.rateCouple || 0)} / ${fmt(prac.ratePsychiatry || 0)} (individual / couples / psych)` : null

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Sessions" sub={`${db.sessions.length} total logged`} action={<Btn onClick={() => setModal(true)}>+ Log Session</Btn>}/>

      <div style={card}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {[['Date'], ['Client'], ['Employer'], ['Practice'], ['Type'], ['Modality'], ['Fee', true]].map(([h, r], i) => (
                <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const cl   = db.clients.find(c => c.id === s.clientId)
              const emp  = db.employers.find(e => e.id === s.employerId)
              const prac = db.practices.find(p => p.id === s.practiceId)
              return (
                <tr key={s.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white }}>
                  <td style={{ ...TD(false), fontFamily:'monospace', fontSize:12, color:C.textMid }}>{s.date}</td>
                  <td style={TD(false)}><span style={{ fontFamily:'monospace', color:C.teal, fontWeight:700, fontSize:12 }}>{cl?.anonId}</span></td>
                  <td style={{ ...TD(false), fontSize:13 }}>{emp?.name}</td>
                  <td style={{ ...TD(false), fontSize:13 }}>{prac?.name}</td>
                  <td style={{ ...TD(false), textTransform:'capitalize', color:C.textMid, fontSize:13 }}>{s.type}</td>
                  <td style={TD(false)}><ModalityBadge modality={s.modality}/></td>
                  <td style={{ ...TD(true), fontFamily:'monospace', color:C.tealDark, fontWeight:700 }}>{fmt(s.feeCents)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Log Session" onClose={() => setModal(false)}>
          <Sel label="Client (Anonymous ID)" value={form.clientId} onChange={e => pickClient(e.target.value)}
            options={[{ value:'', label:'Select client...' }, ...db.clients.map(c => ({ value:c.id, label:c.anonId }))]}/>
          {form.employerId && (
            <div style={{ fontSize:12, color:C.textMid, marginTop:-8, marginBottom:12 }}>
              Employer: {db.employers.find(e => e.id === form.employerId)?.name}
            </div>
          )}
          <Sel label="Session Type" value={form.type} onChange={e => changeType(e.target.value)}
            options={[
              { value:'individual', label:'Individual Therapy' },
              { value:'couple',     label:'Couples Therapy' },
              { value:'psychiatry', label:'Psychiatry' },
            ]}/>

          <div style={{ marginBottom:13 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Session Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date:e.target.value }))}
              style={{ width:'100%', boxSizing:'border-box', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', outline:'none' }}/>
          </div>

          <div style={{ marginBottom:13 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Modality</label>
            <div style={{ display:'flex', gap:0, border:`1px solid ${C.border}`, borderRadius:4, overflow:'hidden' }}>
              {[['in-person', '🏢 In-Person'], ['virtual', '💻 Virtual']].map(([v, l]) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, modality:v }))}
                  style={{ flex:1, padding:'9px 0', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Arial,sans-serif', border:'none', background:form.modality === v ? C.teal : C.white, color:form.modality === v ? C.white : C.textMid, borderRight:v === 'in-person' ? `1px solid ${C.border}` : 'none' }}>
                  {l}
                </button>
              ))}
            </div>
            {form.clientId && db.clients.find(c => c.id === form.clientId)?.modality && (
              <div style={{ fontSize:11, color:C.tealDark, marginTop:5 }}>
                ↑ Pre-filled from client preference ({db.clients.find(c => c.id === form.clientId)?.modality})
              </div>
            )}
          </div>

          <div style={{ marginBottom:13 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Session Fee ($)</label>
            <input type="number" value={form.feeCents} onChange={e => setForm(f => ({ ...f, feeCents:e.target.value }))}
              style={{ width:'100%', boxSizing:'border-box', border:`1px solid ${form.feeCents && parseFloat(form.feeCents) > 0 ? C.teal : C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', outline:'none' }}/>
            {rateHint && <div style={{ fontSize:11, color:C.tealDark, marginTop:5 }}>{rateHint}</div>}
          </div>

          <Btn onClick={addSession} disabled={!form.clientId || !form.date || !form.feeCents}>Log Session</Btn>
        </Modal>
      )}
    </div>
  )
}
