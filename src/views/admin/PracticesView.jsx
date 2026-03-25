import React, { useState } from 'react'
import { C } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { useStore } from '../../data/store'
import { SH, Btn, Inp, Sel, Modal } from '../../components/ui'
import { TH, TD } from '../../components/ui'

export default function PracticesView() {
  const { state: db, dispatch } = useStore()

  const [modal, setModal]   = useState(false)
  const [cModal, setCModal] = useState(null)  // practiceId for add-contract modal
  const [rModal, setRModal] = useState(null)  // practiceId for set-rates modal
  const [form, setForm]     = useState({ name:'', contact:'', email:'', city:'' })
  const [cForm, setCForm]   = useState({ employerId:'', type:'per_employee', rate:'', units:'', margin:'20' })
  const [rForm, setRForm]   = useState({ rateIndividual:'', rateCouple:'', ratePsychiatry:'' })

  const openRates = (prac) => {
    setRForm({
      rateIndividual: String((prac.rateIndividual || 0) / 100),
      rateCouple:     String((prac.rateCouple     || 0) / 100),
      ratePsychiatry: String((prac.ratePsychiatry || 0) / 100),
    })
    setRModal(prac.id)
  }

  const saveRates = () => {
    dispatch({ type: 'UPDATE_PRACTICE', payload: {
      id:             rModal,
      rateIndividual: Math.round(parseFloat(rForm.rateIndividual || 0) * 100),
      rateCouple:     Math.round(parseFloat(rForm.rateCouple     || 0) * 100),
      ratePsychiatry: Math.round(parseFloat(rForm.ratePsychiatry || 0) * 100),
    }})
    setRModal(null)
  }

  const addPractice = () => {
    dispatch({ type: 'ADD_PRACTICE', payload: {
      name: form.name, contact: form.contact, email: form.email, city: form.city,
    }})
    setModal(false)
    setForm({ name:'', contact:'', email:'', city:'' })
  }

  const addContract = () => {
    const labels = {
      per_employee:         `$${cForm.rate}/mo per employee`,
      per_couple:           `$${cForm.rate}/mo per couple`,
      per_psychiatry_block: `$${cForm.rate}/mo per 2-session block`,
    }
    dispatch({ type: 'ADD_CONTRACT', payload: {
      practiceId: cModal,
      employerId: cForm.employerId,
      type:       cForm.type,
      rate:       parseInt(cForm.rate) * 100,
      units:      parseInt(cForm.units),
      margin:     parseInt(cForm.margin),
      label:      labels[cForm.type],
    }})
    setCModal(null)
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Practices" sub={`${db.practices.length} in network`} action={<Btn onClick={() => setModal(true)}>+ Add Practice</Btn>}/>

      <div style={{ display:'grid', gap:14 }}>
        {db.practices.map(prac => {
          const clins     = db.clinicians.filter(c => c.practiceId === prac.id)
          const contracts = db.contracts.filter(c => c.practiceId === prac.id && c.active)
          const sessions  = db.sessions.filter(s => s.practiceId === prac.id).length
          const paid      = db.payouts.filter(p => p.practiceId === prac.id && p.status === 'paid').reduce((s, p) => s + p.netCents, 0)

          return (
            <div key={prac.id} style={{ ...card, padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:C.textDark }}>{prac.name}</div>
                  <div style={{ fontSize:12, color:C.textMid, marginTop:2 }}>{prac.city}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Btn variant="ghost" small onClick={() => openRates(prac)}>Set Rates</Btn>
                  <Btn variant="secondary" small onClick={() => setCModal(prac.id)}>+ Contract</Btn>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:'12px 14px', marginBottom:14 }}>
                {[['Individual', prac.rateIndividual], ['Couples', prac.rateCouple], ['Psychiatry', prac.ratePsychiatry]].map(([l, r]) => (
                  <div key={l} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:r ? C.tealDark : C.border, fontFamily:'monospace' }}>{r ? fmt(r) : '—'}</div>
                    <div style={{ fontSize:9, color:C.textMid }}>per session</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, paddingTop:14, borderTop:`1px solid ${C.border}`, marginBottom:14 }}>
                {[['Clinicians', clins.length], ['Sessions', sessions], ['Paid Out', fmt(paid)]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:l === 'Paid Out' ? C.tealDark : C.textDark, fontFamily:'monospace' }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7 }}>Clinicians</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:contracts.length ? 14 : 0 }}>
                {clins.length > 0
                  ? clins.map(cl => (
                    <span key={cl.id} style={{ fontSize:11, background:C.cream, border:`1px solid ${C.border}`, color:C.textDark, padding:'3px 8px', borderRadius:3 }}>
                      {cl.name} · {cl.specialty}
                    </span>
                  ))
                  : <span style={{ fontSize:12, color:C.border }}>No clinicians added yet</span>
                }
              </div>

              {contracts.length > 0 && (
                <div style={{ paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7 }}>Contracts</div>
                  {contracts.map(c => (
                    <div key={c.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.textMid, marginBottom:3 }}>
                      <span>{db.employers.find(e => e.id === c.employerId)?.name}</span>
                      <span style={{ fontFamily:'monospace', color:C.textDark }}>{c.label} · {c.units} units · {c.margin}% margin</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title="Add Practice" onClose={() => setModal(false)}>
          <Inp label="Practice Name" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))}/>
          <Inp label="City" value={form.city} onChange={e => setForm(f => ({ ...f, city:e.target.value }))} placeholder="New York, NY"/>
          <Inp label="Contact Name" value={form.contact} onChange={e => setForm(f => ({ ...f, contact:e.target.value }))}/>
          <Inp label="Contact Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))}/>
          <Btn onClick={addPractice} disabled={!form.name}>Add Practice</Btn>
        </Modal>
      )}

      {rModal && (() => {
        const prac = db.practices.find(p => p.id === rModal)
        return (
          <Modal title={`Session Rates — ${prac?.name}`} onClose={() => setRModal(null)}>
            <div style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:'10px 12px', fontSize:12, color:C.textMid, marginBottom:16 }}>
              These rates are used to auto-populate the session fee when a session is logged for this practice. You can still override per session.
            </div>
            <Inp label="Individual Therapy Rate ($/session)" type="number" value={rForm.rateIndividual} onChange={e => setRForm(f => ({ ...f, rateIndividual:e.target.value }))} placeholder="250"/>
            <Inp label="Couples Therapy Rate ($/session)"    type="number" value={rForm.rateCouple}     onChange={e => setRForm(f => ({ ...f, rateCouple:e.target.value }))}     placeholder="350"/>
            <Inp label="Psychiatry Rate ($/session)"         type="number" value={rForm.ratePsychiatry} onChange={e => setRForm(f => ({ ...f, ratePsychiatry:e.target.value }))} placeholder="400"/>
            <Btn onClick={saveRates}>Save Rates</Btn>
          </Modal>
        )
      })()}

      {cModal && (
        <Modal title="Add Contract" onClose={() => setCModal(null)}>
          <Sel label="Employer" value={cForm.employerId} onChange={e => setCForm(f => ({ ...f, employerId:e.target.value }))}
            options={[{ value:'', label:'Select employer...' }, ...db.employers.map(e => ({ value:e.id, label:e.name }))]}/>
          <Sel label="Contract Type" value={cForm.type} onChange={e => setCForm(f => ({ ...f, type:e.target.value }))}
            options={[
              { value:'per_employee',         label:'Per Employee / Month' },
              { value:'per_couple',           label:'Per Couple / Month' },
              { value:'per_psychiatry_block', label:'Per Psychiatry Block / Month' },
            ]}/>
          <Inp label="Rate ($)"          type="number" value={cForm.rate}   onChange={e => setCForm(f => ({ ...f, rate:e.target.value }))}   placeholder="1000"/>
          <Inp label="Units"             type="number" value={cForm.units}  onChange={e => setCForm(f => ({ ...f, units:e.target.value }))}  placeholder="5"/>
          <Inp label="Lumina Margin (%)" type="number" value={cForm.margin} onChange={e => setCForm(f => ({ ...f, margin:e.target.value }))} placeholder="20"/>
          <Btn onClick={addContract} disabled={!cForm.employerId || !cForm.rate}>Add Contract</Btn>
        </Modal>
      )}
    </div>
  )
}
