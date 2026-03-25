import React, { useState } from 'react'
import { C, US_STATES, PSYPACT_STATES } from '../../utils/constants'
import { useStore } from '../../data/store'
import { SH, Btn, Inp, Sel, Modal, Badge, ModalityBadge, Note } from '../../components/ui'
import { TH, TD } from '../../components/ui'

export default function ClientsView() {
  const { state: db, dispatch } = useStore()

  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({
    clientName:'', employerId:'', practiceId:'', clinicianId:'',
    state:'', modality:'in-person', email:'', phone:'',
  })

  const filtC = db.clinicians.filter(c => !form.practiceId || c.practiceId === form.practiceId)

  const addClient = () => {
    dispatch({ type: 'ADD_CLIENT', payload: { ...form } })
    setModal(false)
    setForm({ clientName:'', employerId:'', practiceId:'', clinicianId:'', state:'', modality:'in-person', email:'', phone:'' })
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Clients" sub={`${db.clients.length} enrolled`} action={<Btn onClick={() => setModal(true)}>+ Add Client</Btn>}/>

      <div style={card}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {[['Name'], ['Anon ID'], ['Employer'], ['Practice'], ['State'], ['Modality'], ['Intake'], ['Status'], ['Assess.', true]].map(([h, r], i) => (
                <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {db.clients.map((c, i) => {
              const emp  = db.employers.find(e => e.id === c.employerId)
              const prac = db.practices.find(p => p.id === c.practiceId)
              const lastAssess = db.assessments
                .filter(a => a.clientId === c.id)
                .sort((a, b) => b.date.localeCompare(a.date))[0]
              const daysSince  = lastAssess ? Math.floor((new Date() - new Date(lastAssess.date)) / (1000 * 60 * 60 * 24)) : null
              const assessDue  = daysSince === null || daysSince >= 28

              return (
                <tr key={c.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white }}>
                  <td style={{ ...TD(false), fontWeight:600 }}>{c.clientName || <span style={{ color:C.border }}>—</span>}</td>
                  <td style={TD(false)}><span style={{ fontFamily:'monospace', color:C.teal, fontWeight:700, fontSize:11 }}>{c.anonId}</span></td>
                  <td style={{ ...TD(false), fontSize:12 }}>{emp?.name}</td>
                  <td style={{ ...TD(false), fontSize:12 }}>{prac?.name}</td>
                  <td style={{ ...TD(false), fontSize:12 }}>
                    <div>{c.state || '—'}</div>
                    {c.state && c.modality === 'virtual' && (
                      <div style={{ fontSize:9, marginTop:1, color:PSYPACT_STATES.has(c.state) ? C.tealGreen : '#D4721A', fontWeight:700 }}>
                        {PSYPACT_STATES.has(c.state) ? 'PSYPACT' : 'Non-PSYPACT'}
                      </div>
                    )}
                  </td>
                  <td style={TD(false)}><ModalityBadge modality={c.modality}/></td>
                  <td style={{ ...TD(false), fontFamily:'monospace', fontSize:11, color:C.textMid }}>{c.intakeDate}</td>
                  <td style={TD(false)}><Badge status={c.status}/></td>
                  <td style={TD(true)}>
                    <span style={{ fontSize:11, fontFamily:'monospace', color:assessDue ? '#D4721A' : C.tealGreen, fontWeight:700 }}>
                      {assessDue ? 'DUE' : daysSince !== null ? `${daysSince}d ago` : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add Client" onClose={() => setModal(false)}>
          <Note>Name visible to Lumina admin and assigned practice only. Employers always see anonymous ID.</Note>
          <Inp label="Client Full Name" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName:e.target.value }))} placeholder="First Last"/>
          <Sel label="Employer" value={form.employerId} onChange={e => setForm(f => ({ ...f, employerId:e.target.value }))}
            options={[{ value:'', label:'Select...' }, ...db.employers.map(e => ({ value:e.id, label:e.name }))]}/>
          <Sel label="Practice" value={form.practiceId} onChange={e => setForm(f => ({ ...f, practiceId:e.target.value, clinicianId:'' }))}
            options={[{ value:'', label:'Select...' }, ...db.practices.map(p => ({ value:p.id, label:p.name }))]}/>
          <Sel label="Clinician" value={form.clinicianId} onChange={e => setForm(f => ({ ...f, clinicianId:e.target.value }))}
            options={[{ value:'', label:'Select...' }, ...filtC.map(c => ({ value:c.id, label:`${c.name} · ${c.specialty}` }))]}/>

          <div style={{ marginBottom:13 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Client State</label>
            <select value={form.state} onChange={e => setForm(f => ({ ...f, state:e.target.value }))}
              style={{ width:'100%', border:`1px solid ${form.state ? C.teal : C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', background:C.white, outline:'none' }}>
              <option value="">Select state...</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {form.state && form.modality === 'virtual' && (
              <div style={{ fontSize:11, marginTop:4, fontWeight:600, color:PSYPACT_STATES.has(form.state) ? C.tealGreen : '#D4721A' }}>
                {PSYPACT_STATES.has(form.state) ? '✓ PSYPACT state' : '⚠ Non-PSYPACT — verify licensure'}
              </div>
            )}
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
          </div>

          <Inp label="Client Email (for assessments)" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))}/>
          <Inp label="Client Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone:e.target.value }))}/>
          <Btn onClick={addClient} disabled={!form.clientName || !form.employerId || !form.practiceId || !form.clinicianId}>Enroll Client</Btn>
        </Modal>
      )}
    </div>
  )
}
