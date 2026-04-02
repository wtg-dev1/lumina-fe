import React, { useEffect, useState } from 'react'
import { C, PSYPACT_STATES } from '../../utils/constants'
import { fmt, today } from '../../utils/helpers'
import { useCareStore, useFinanceStore, useOrgStore } from '../../data/stores'
import { Btn, Inp, Modal, ModalityBadge } from '../../components/ui'

export default function PracticePortalView({ practiceId }) {
  const org = useOrgStore()
  const care = useCareStore()
  const finance = useFinanceStore()
  const db = {
    practices: org.practices,
    clinicians: org.clinicians,
    employers: org.employers,
    clients: care.clients,
    referrals: care.referrals,
    sessions: care.sessions,
    payouts: finance.payouts,
  }

  useEffect(() => {
    org.ensureDetailsLoaded()
    care.ensureCoreLoaded()
    finance.ensureSummaryLoaded()
  }, [org.ensureDetailsLoaded, care.ensureCoreLoaded, finance.ensureSummaryLoaded])

  const [nameModal, setNameModal] = useState(null)  // { refId, anonId }
  const [nameInput, setNameInput] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [confirmLoading, setConfirmLoading] = useState(false)

  const prac           = db.practices.find(p => p.id === practiceId)
  const myReferrals    = (db.referrals || []).filter(r => r.practiceId === practiceId).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  const mySessions     = db.sessions.filter(s => s.practiceId === practiceId)
  const myPayouts      = db.payouts.filter(p => p.practiceId === practiceId)
  const pendingActions = myReferrals.filter(r => !r.practiceSessionBookedAt && r.practiceId).length

  const loopStep = (ref) => {
    if (!ref.practiceConfirmedAt)      return { label:'Confirm Receipt',      action:'confirm',   color:C.teal,      desc:"Acknowledge this referral has been received. You'll also enter the client's name.", needsName:true }
    if (!ref.practiceContactedAt)     return { label:'Mark Client Contacted', action:'contacted', color:'#D4721A',   desc:'Confirm the practice has made contact with the client.' }
    if (!ref.practiceSessionBookedAt) return { label:'Mark Session Booked',   action:'booked',    color:C.tealGreen, desc:'Confirm the first session has been scheduled.' }
    return null
  }

  const loopStatus = (ref) => {
    if (ref.practiceSessionBookedAt) return { label:'Session Booked ✓',       bg:'#E6F4F1', color:C.tealDark, border:C.teal }
    if (ref.practiceContactedAt)     return { label:'Client Contacted',        bg:'#FFF3E0', color:'#8B5E00',  border:'#F0A500' }
    if (ref.practiceConfirmedAt)     return { label:'Receipt Confirmed',       bg:'#E8F0F7', color:'#1F4D78',  border:'#2E74B5' }
    return                                  { label:'Awaiting Confirmation',   bg:'#FCE8E8', color:'#B03A3A',  border:'#D9534F' }
  }

  const handleStep = async (ref, next) => {
    if (next.needsName) {
      setNameModal({ refId: ref.id, anonId: ref.anonId })
      setNameInput('')
      return
    }

    try {
      setActionLoadingId(ref.id)
      if (next.action === 'contacted') {
        await care.markReferralContacted(ref.id)
      } else if (next.action === 'booked') {
        await care.markReferralBooked(ref.id)
      }
      setActionError('')
    } catch (e) {
      setActionError(e?.message || 'Unable to update referral workflow step.')
    } finally {
      setActionLoadingId('')
    }
  }

  const confirmReceipt = async () => {
    try {
      setConfirmLoading(true)
      await care.confirmReferral({
        refId:      nameModal.refId,
        clientName: nameInput.trim(),
      })
      setActionError('')
      setNameModal(null)
    } catch (e) {
      setActionError(e?.message || 'Unable to confirm referral receipt.')
    } finally {
      setConfirmLoading(false)
    }
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      {/* Practice header */}
      <div style={{ ...card, marginBottom:20, overflow:'hidden' }}>
        <div style={{ background:C.tealDark, padding:'18px 22px' }}>
          <div style={{ fontSize:10, color:'#A8D5D5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Practice Portal</div>
          <div style={{ fontSize:18, fontWeight:700, color:C.white }}>{prac?.name}</div>
          <div style={{ fontSize:12, color:'#A8D5D5', marginTop:3 }}>{prac?.city}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
          {[
            ['Referrals',      myReferrals.length,                                  'total'],
            ['Action Needed',  pendingActions,                                       'incomplete loop'],
            ['Sessions',       mySessions.length,                                   'all time'],
            ['Payouts',        myPayouts.filter(p => p.status === 'paid').length,   'paid'],
          ].map(([l, v, sub], i) => (
            <div key={l} style={{ padding:'14px 18px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:700, color: l === 'Action Needed' && v > 0 ? '#D4721A' : C.textDark, fontFamily:'monospace' }}>{v}</div>
              <div style={{ fontSize:10, color:C.textMid, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session rates */}
      <div style={{ ...card, padding:16, marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Your Session Rates (set by Lumina)</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[['Individual', prac?.rateIndividual], ['Couples', prac?.rateCouple], ['Psychiatry', prac?.ratePsychiatry]].map(([l, r]) => (
            <div key={l} style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:'12px 14px', textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:700, color:r ? C.tealDark : C.border, fontFamily:'monospace' }}>{r ? fmt(r) : '—'}</div>
              <div style={{ fontSize:9, color:C.textMid, marginTop:2 }}>per session</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals */}
      <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Incoming Referrals</div>
      {actionError && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'10px 14px', color:'#B03A3A', fontSize:12, marginBottom:12 }}>
          {actionError}
        </div>
      )}

      {myReferrals.length === 0 && (
        <div style={{ ...card, padding:24, textAlign:'center', color:C.textMid, fontSize:13 }}>No referrals assigned to this practice yet.</div>
      )}

      <div style={{ display:'grid', gap:12 }}>
        {myReferrals.map(ref => {
          const clin = db.clinicians.find(c => c.id === ref.clinicianId)
          const emp  = db.employers.find(e  => e.id === ref.employerId)
          const next = loopStep(ref)
          const ls   = loopStatus(ref)

          return (
            <div key={ref.id} style={{ ...card, padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'monospace', color:C.teal, fontWeight:700, fontSize:13 }}>{ref.anonId}</span>
                    {ref.practiceConfirmedAt && (() => {
                      const c = db.clients.find(x => x.anonId === ref.anonId)
                      return c?.clientName ? <span style={{ fontSize:13, fontWeight:700, color:C.textDark }}>{c.clientName}</span> : null
                    })()}
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, background:ls.bg, color:ls.color, border:`1px solid ${ls.border}` }}>{ls.label}</span>
                    <ModalityBadge modality={ref.modality}/>
                  </div>
                  <div style={{ fontSize:11, color:C.textMid }}>
                    Referred {ref.createdAt} · {emp?.name} · {ref.presNeed} · <span style={{ textTransform:'capitalize' }}>{ref.sessionType}</span>
                    {ref.state && (
                      <span> · {ref.state}
                        {ref.modality === 'virtual' && (
                          <span style={{ marginLeft:4, fontWeight:700, color:PSYPACT_STATES.has(ref.state) ? C.tealGreen : '#D4721A' }}>
                            {PSYPACT_STATES.has(ref.state) ? '(PSYPACT ✓)' : '(Non-PSYPACT ⚠)'}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {next && (
                  <button onClick={() => handleStep(ref, next)}
                    disabled={actionLoadingId === ref.id || confirmLoading}
                    style={{ background:next.color, color:C.white, border:'none', borderRadius:4, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Arial,sans-serif', whiteSpace:'nowrap' }}>
                    {actionLoadingId === ref.id ? 'Saving...' : next.label}
                  </button>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
                {[
                  { label:'Receipt Confirmed',   date:ref.practiceConfirmedAt,     icon:'1' },
                  { label:'Client Contacted',     date:ref.practiceContactedAt,     icon:'2' },
                  { label:'First Session Booked', date:ref.practiceSessionBookedAt, icon:'3' },
                ].map(({ label, date, icon }) => (
                  <div key={label} style={{ background: date ? `${C.tealGreen}12` : C.bgPage, border:`1px solid ${date ? C.tealGreen : C.border}`, borderRadius:4, padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', background:date ? C.tealGreen : C.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:C.white, fontWeight:700, flexShrink:0 }}>{date ? '✓' : icon}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:date ? C.tealDark : C.textMid, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                    </div>
                    <div style={{ fontSize:11, fontFamily:'monospace', color:date ? C.tealDark : C.border, paddingLeft:24 }}>{date || '—'}</div>
                  </div>
                ))}
              </div>

              {next && (
                <div style={{ background:`${next.color}10`, border:`1px solid ${next.color}35`, borderRadius:4, padding:'8px 12px', fontSize:12, color:next.color }}>
                  → <strong>Action needed:</strong> {next.desc}
                </div>
              )}

              <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', fontSize:12, color:C.textMid }}>
                <span>{clin ? `Clinician: ${clin.name} · ${clin.credential} · ${clin.specialty}` : 'No clinician assigned'}</span>
                {ref.notes && <span style={{ fontStyle:'italic' }}>"{ref.notes}"</span>}
              </div>
            </div>
          )
        })}
      </div>

      {nameModal && (
        <Modal title="Confirm Receipt — Enter Client Name" onClose={() => setNameModal(null)}>
          <div style={{ background:`${C.teal}0f`, border:`1px solid ${C.teal}35`, borderRadius:4, padding:'10px 12px', fontSize:12, color:C.tealDark, marginBottom:16, lineHeight:1.7 }}>
            Enter the client's full name. Visible to your practice and Lumina admin only — never shared with employers.
          </div>
          <Inp label="Client Full Name" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="First Last"/>
          <Btn onClick={confirmReceipt} disabled={!nameInput.trim() || confirmLoading}>
            {confirmLoading ? 'Confirming...' : 'Confirm Receipt'}
          </Btn>
        </Modal>
      )}
    </div>
  )
}
