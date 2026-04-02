import React, { useEffect, useRef, useState } from 'react'
import { C, US_STATES, PSYPACT_STATES, PRESENTING_NEEDS, SESSION_TYPES, STATUS_FLOW } from '../../utils/constants'
import { today, getServiceability } from '../../utils/helpers'
import { useCareStore, useOrgStore } from '../../data/stores'
import { SH, Btn, Inp, Sel, Modal, Badge, ModalityBadge } from '../../components/ui'

export default function ReferralsView() {
  const org = useOrgStore()
  const care = useCareStore()
  const db = {
    employers: org.employers,
    practices: org.practices,
    clinicians: org.clinicians,
    clients: care.clients,
    referrals: care.referrals,
  }
  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const prevDebouncedQRef = useRef(debouncedQ)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(searchInput.trim()), 500)
    return () => clearTimeout(id)
  }, [searchInput])
  const [apiError, setApiError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        await org.ensureDetailsLoaded()
        await care.ensureCoreLoaded()
        setApiError('')
      } catch (e) {
        setApiError(e?.message || 'Failed loading referrals.')
      }
    })()
    // Intentionally run once on mount; store methods are not stable references.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const qChanged = prevDebouncedQRef.current !== debouncedQ
        prevDebouncedQRef.current = debouncedQ
        const effectivePage = qChanged ? 1 : page
        if (qChanged && page !== 1) setPage(1)
        await care.load_referrals_page({
          page: effectivePage,
          limit,
          q: debouncedQ || undefined,
        })
        setApiError('')
      } catch (e) {
        setApiError(e?.message || 'Failed loading referrals.')
      }
    })()
  }, [page, limit, debouncedQ])

  const [modal, setModal]   = useState(false)
  const [msgModal, setMsgModal] = useState(null)  // referral id
  const [msgTab, setMsgTab] = useState('email')
  const [filter, setFilter] = useState('all')
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState({
    employerId:'', presNeed:'Anxiety', location:'', practiceId:'', sessionType:'individual',
    modality:'in-person', state:'', clientEmail:'', clientPhone:'', notes:'',
  })
  const [match, setMatch]   = useState({ practiceId:'', clinicianId:'' })

  const cities = [...new Set(db.practices.map(p => p.city))].sort()

  const suggestedPractices  = form.location ? db.practices.filter(p => p.city === form.location) : db.practices
  const effectivePractices  = form.practiceId ? db.practices.filter(p => p.id === form.practiceId) : suggestedPractices
  const matchedClinicians   = match.practiceId ? db.clinicians.filter(c => c.practiceId === match.practiceId) : []

  const handleCityChange = (city) => {
    const practiceStillValid = !city || db.practices.find(p => p.id === form.practiceId && p.city === city)
    setForm(f => ({ ...f, location:city, practiceId: practiceStillValid ? f.practiceId : '' }))
    setMatch(m => ({ ...m, practiceId:'', clinicianId:'' }))
  }

  const handlePracticeChange = (pid) => {
    const p = db.practices.find(x => x.id === pid)
    setForm(f => ({ ...f, practiceId:pid, location: pid && p ? p.city : f.location }))
    setMatch(m => ({ ...m, practiceId:pid || '', clinicianId:'' }))
  }

  const resetForm = () => {
    setForm({ employerId:'', presNeed:'Anxiety', location:'', practiceId:'', sessionType:'individual', modality:'in-person', state:'', clientEmail:'', clientPhone:'', notes:'' })
    setMatch({ practiceId:'', clinicianId:'' })
    setStep(1)
  }

  const submit = async () => {
    try {
      setSubmitLoading(true)
      await care.addReferral({
        referral: {
          ...form,
          status: 'pending',
          practiceId: match.practiceId || form.practiceId,
          clinicianId: match.clinicianId,
        },
        practiceId: match.practiceId || form.practiceId,
        clinicianId: match.clinicianId,
      })
      await care.load_referrals_page({ page, limit, q: debouncedQ || undefined, force: true })
      setApiError('')
      setModal(false)
      resetForm()
    } catch (e) {
      setApiError(e?.message || 'Failed to create referral.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      setStatusUpdatingId(id)
      await care.updateReferral({
        id,
        status,
        ...(status === 'scheduled' ? { scheduledAt: today() } : {}),
      })
      await care.load_referrals_page({ page, limit, q: debouncedQ || undefined, force: true })
      setApiError('')
    } catch (e) {
      setApiError(e?.message || 'Failed to update referral.')
    } finally {
      setStatusUpdatingId('')
    }
  }

  const genMessage = (ref, mode) => {
    const prac = db.practices.find(p  => p.id === ref.practiceId)
    const clin = db.clinicians.find(c => c.id === ref.clinicianId)
    const emp  = db.employers.find(e  => e.id === ref.employerId)
    if (mode === 'email') return `Subject: Your Lumina Therapy Alliance Appointment\n\nHello,\n\nThank you for reaching out to Lumina Therapy Alliance through ${emp?.name || 'your employer'}.\n\nWe have matched you with ${prac?.name || 'a practice'}${clin ? `, where you will be working with ${clin.name} (${clin.credential})` : ''}, located in ${prac?.city || ''}.\n\nYour care coordinator will be in touch within 24 hours to confirm your first appointment. You can expect your first session within 72 hours of booking.\n\nYour anonymous client ID is: ${ref.anonId}\n\nIf you have any questions, please reply to this email or call us directly.\n\nWarm regards,\nLumina Therapy Alliance Care Team\ndrselling@luminatherapyalliance.com\n(718) 757-7033`
    return `Hi, this is Lumina Therapy Alliance. We've matched you with ${prac?.name || 'a practice'} in ${prac?.city || 'your area'}${clin ? ` — your clinician will be ${clin.name}` : ''}.  Your coordinator will call within 24 hrs to confirm your first appointment (within 72 hrs of booking). Questions? Call (718) 757-7033. Ref: ${ref.anonId}`
  }

  const counts = {
    all: db.referrals.length,
    ...STATUS_FLOW.reduce((a, s) => ({ ...a, [s]: db.referrals.filter(r => r.status === s).length }), {}),
  }

  const pagedReferrals = care.referrals_page_items || []
  const pagination = care.referrals_pagination || { page: 1, limit, total: pagedReferrals.length, total_pages: 1 }
  const filtered = filter === 'all' ? pagedReferrals : pagedReferrals.filter(r => r.status === filter)
  const sorted   = [...filtered].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  const msgRef = msgModal ? db.referrals.find(r => r.id === msgModal) : null

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Referrals" sub="Intake · matching · client outreach"
        action={
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', justifyContent:'flex-end' }}>
            <input
              type="search"
              placeholder="Search referrals…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search referrals"
              style={{
                width: 220,
                minWidth: 160,
                boxSizing: 'border-box',
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: '8px 10px',
                fontSize: 13,
                color: C.textDark,
                fontFamily: 'Arial,sans-serif',
                outline: 'none',
              }}
            />
            <Btn onClick={() => { resetForm(); setModal(true) }}>+ New Referral</Btn>
          </div>
        }/>

      {(apiError || care.referrals_error) && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'10px 14px', color:'#B03A3A', fontSize:12, marginBottom:12 }}>
          {apiError || care.referrals_error}
        </div>
      )}

      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {[['all','All'], ['pending','Pending'], ['scheduled','Scheduled'], ['active','Active'], ['discharged','Discharged']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:filter === v ? 700 : 500, cursor:'pointer', background:filter === v ? C.teal : C.white, color:filter === v ? C.white : C.textMid, border:`1px solid ${filter === v ? C.teal : C.border}` }}>
            {l} <span style={{ fontFamily:'monospace', fontSize:11, opacity:0.8 }}>({counts[v] || 0})</span>
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gap:12 }}>
        {care.referrals_loading && (
          <div style={{ ...card, padding:24, textAlign:'center', color:C.textMid, fontSize:13 }}>
            Loading referrals...
          </div>
        )}
        {!care.referrals_loading && sorted.length === 0 && (
          <div style={{ ...card, padding:24, textAlign:'center', color:C.textMid, fontSize:13 }}>
            No referrals{filter !== 'all' ? ` with status "${filter}"` : ''}.
          </div>
        )}
        {sorted.map(ref => {
          const emp  = db.employers.find(e  => e.id === ref.employerId)
          const prac = db.practices.find(p  => p.id === ref.practiceId)
          const clin = db.clinicians.find(c => c.id === ref.clinicianId)
          const nextStatus = { pending:'scheduled', scheduled:'active', active:'discharged' }[ref.status]
          const nextLabel  = { pending:'Mark Scheduled', scheduled:'Mark Active', active:'Discharge' }[ref.status]

          return (
            <div key={ref.id} style={{ ...card, padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontFamily:'monospace', color:C.teal, fontWeight:700, fontSize:13 }}>{ref.anonId}</span>
                  <Badge status={ref.status}/>
                  <span style={{ fontSize:11, color:C.textMid, fontFamily:'monospace' }}>{ref.createdAt}</span>
                </div>
                <div style={{ display:'flex', gap:7 }}>
                  <Btn variant="ghost" small onClick={() => { setMsgTab('email'); setMsgModal(ref.id) }}>📨 Message</Btn>
                  {nextStatus && (
                    <Btn
                      variant="secondary"
                      small
                      onClick={() => updateStatus(ref.id, nextStatus)}
                      disabled={statusUpdatingId === ref.id || care.referrals_loading}
                    >
                      {statusUpdatingId === ref.id ? 'Updating...' : nextLabel}
                    </Btn>
                  )}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:ref.notes ? 12 : 0 }}>
                {[['Employer', emp?.name || '—'], ['Presenting Need', ref.presNeed], ['Session Type', ref.sessionType], ['Client State', ref.state || '—']].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:12, color:C.textDark, textTransform:'capitalize' }}>{v}</div>
                  </div>
                ))}
              </div>

              {(ref.modality || ref.state) && (
                <div style={{ marginTop:8, marginBottom:4, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <ModalityBadge modality={ref.modality}/>
                  {ref.state && ref.modality === 'virtual' && (() => {
                    const isPsypact = PSYPACT_STATES.has(ref.state)
                    return (
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, background:isPsypact ? '#E6F4F1' : '#FFF3E0', color:isPsypact ? C.tealDark : '#8B5E00', border:`1px solid ${isPsypact ? C.teal : '#F0A500'}` }}>
                        {isPsypact ? '✓ PSYPACT' : '⚠ Non-PSYPACT'}
                      </span>
                    )
                  })()}
                </div>
              )}

              <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  {prac
                    ? <>
                        <div style={{ fontSize:12, color:C.textDark }}><strong>Practice:</strong> {prac.name} · {prac.city}</div>
                        {clin && <div style={{ fontSize:12, color:C.textMid }}>Clinician: {clin.name} ({clin.credential}) · {clin.specialty}</div>}
                      </>
                    : <div style={{ fontSize:12, color:'#D4721A', fontWeight:600 }}>⚠ No practice matched yet</div>
                  }
                </div>
                {prac && (
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.05em' }}>Practice loop:</span>
                    {[['✓', ref.practiceConfirmedAt, 'Confirmed'], ['✓', ref.practiceContactedAt, 'Contacted'], ['✓', ref.practiceSessionBookedAt, 'Booked']].map(([n, d, l], i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11 }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', background:d ? C.tealGreen : C.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:C.white, fontWeight:700 }}>{d ? '✓' : i + 1}</div>
                        <span style={{ color:d ? C.tealDark : C.textMid, fontWeight:d ? 700 : 400 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {ref.notes     && <div style={{ marginTop:10, fontSize:12, color:C.textMid, fontStyle:'italic' }}>"{ref.notes}"</div>}
              {ref.clientEmail && <div style={{ marginTop:6, fontSize:11, color:C.textMid }}>📧 {ref.clientEmail}{ref.clientPhone ? `  ·  📱 ${ref.clientPhone}` : ''}</div>}
            </div>
          )
        })}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, gap:10 }}>
        <div style={{ fontSize:12, color:C.textMid }}>
          Page <strong style={{ color:C.textDark }}>{pagination.page}</strong> of <strong style={{ color:C.textDark }}>{Math.max(1, pagination.total_pages || 1)}</strong>
          <span style={{ marginLeft:8 }}>· Total referrals: <strong style={{ color:C.textDark }}>{pagination.total || 0}</strong></span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Btn
            variant="secondary"
            small
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1 || care.referrals_loading}
          >
            Prev
          </Btn>
          <Btn
            variant="secondary"
            small
            onClick={() => setPage((p) => Math.min((pagination.total_pages || 1), p + 1))}
            disabled={pagination.page >= (pagination.total_pages || 1) || care.referrals_loading}
          >
            Next
          </Btn>
        </div>
      </div>

      {/* ── New referral modal (3-step) ── */}
      {modal && (
        <Modal title={`New Referral — Step ${step} of 3`} onClose={() => { setModal(false); resetForm() }}>
          {step === 1 && (
            <div>
              <div style={{ fontSize:12, color:C.textMid, marginBottom:16, lineHeight:1.6 }}>Step 1: Capture intake information from the employer or client.</div>
              <Sel label="Employer" value={form.employerId} onChange={e => setForm(f => ({ ...f, employerId:e.target.value }))}
                options={[{ value:'', label:'Select employer...' }, ...db.employers.map(e => ({ value:e.id, label:e.name }))]}/>
              <Sel label="Presenting Need" value={form.presNeed} onChange={e => setForm(f => ({ ...f, presNeed:e.target.value }))}
                options={PRESENTING_NEEDS.map(n => ({ value:n, label:n }))}/>
              <Sel label="Session Type" value={form.sessionType} onChange={e => setForm(f => ({ ...f, sessionType:e.target.value }))}
                options={SESSION_TYPES}/>

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

              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Client State (where they are located)</label>
                <select value={form.state} onChange={e => setForm(f => ({ ...f, state:e.target.value }))}
                  style={{ width:'100%', border:`1px solid ${form.state ? C.teal : C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', background:C.white, outline:'none' }}>
                  <option value="">Select state...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {form.state && (() => {
                  const sv = getServiceability(form.state, form.modality)
                  return sv ? (
                    <div style={{ fontSize:11, marginTop:5, fontWeight:600, color:sv.color, display:'flex', alignItems:'center', gap:4 }}>
                      <span>{sv.ok ? '✓' : '⚠'}</span><span>{sv.label}</span>
                    </div>
                  ) : null
                })()}
              </div>

              <Sel label="Preferred City" value={form.location} onChange={e => handleCityChange(e.target.value)}
                options={[{ value:'', label:'Any city / no preference' }, ...cities.map(c => ({ value:c, label:c }))]}/>

              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>
                  Specific Practice <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:C.border }}>(optional — or choose on next step)</span>
                </label>
                <select value={form.practiceId} onChange={e => handlePracticeChange(e.target.value)}
                  style={{ width:'100%', border:`1px solid ${form.practiceId ? C.teal : C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', background:C.white, outline:'none' }}>
                  <option value="">— Let me choose on next step —</option>
                  {(form.location ? db.practices.filter(p => p.city === form.location) : db.practices).map(p => (
                    <option key={p.id} value={p.id}>{p.name} · {p.city}</option>
                  ))}
                </select>
                {form.practiceId && <div style={{ fontSize:11, color:C.teal, marginTop:4 }}>✓ Pre-selected — you can still change on the next step.</div>}
              </div>

              <Inp label="Client Email" type="email" value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail:e.target.value }))}/>
              <Inp label="Client Phone (optional)" value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone:e.target.value }))} placeholder="555-000-0000"/>
              <Inp label="Coordinator Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} placeholder="Any context from the call..."/>
              <Btn onClick={() => { if (form.practiceId) setMatch(m => ({ ...m, practiceId:form.practiceId })); setStep(2) }} disabled={!form.employerId || !form.clientEmail}>Next: Match Practice →</Btn>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize:12, color:C.textMid, marginBottom:16, lineHeight:1.6 }}>
                Step 2: Confirm or change the practice and assign a clinician.<br/>
                <strong style={{ color:C.tealDark }}>Need: {form.presNeed} · {form.sessionType}{form.location ? ` · ${form.location}` : ''}</strong>
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                {form.practiceId ? 'Pre-selected Practice — click to change' : form.location ? `Practices in ${form.location}` : 'All Practices'}
              </div>
              <div style={{ display:'grid', gap:8, marginBottom:16 }}>
                {effectivePractices.map(p => {
                  const isSel    = match.practiceId === p.id
                  const rateKey  = 'rate' + form.sessionType.charAt(0).toUpperCase() + form.sessionType.slice(1)
                  const rate     = p[rateKey] || p.rateIndividual
                  return (
                    <div key={p.id} onClick={() => setMatch(m => ({ ...m, practiceId:p.id, clinicianId:'' }))}
                      style={{ border:`2px solid ${isSel ? C.teal : C.border}`, borderRadius:5, padding:'10px 14px', cursor:'pointer', background:isSel ? `${C.teal}0a` : C.white, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:C.textDark }}>{p.name}</div>
                        <div style={{ fontSize:11, color:C.textMid, marginTop:2 }}>{p.city}</div>
                      </div>
                      <div style={{ textAlign:'right', fontSize:11, color:isSel ? C.tealDark : C.textMid, fontFamily:'monospace', fontWeight:isSel ? 700 : 400 }}>
                        {rate ? `${rate / 100 % 1 === 0 ? `$${rate / 100}` : `$${(rate / 100).toFixed(2)}`}/session` : ''}
                      </div>
                    </div>
                  )
                })}
                {(form.location || form.practiceId) && (
                  <button onClick={() => { setForm(f => ({ ...f, location:'', practiceId:'' })); setMatch(m => ({ ...m, practiceId:'', clinicianId:'' })) }}
                    style={{ background:'none', border:`1px dashed ${C.border}`, borderRadius:5, padding:'8px', fontSize:12, color:C.textMid, cursor:'pointer', fontFamily:'Arial,sans-serif' }}>
                    Show all practices →
                  </button>
                )}
              </div>
              {match.practiceId && (
                <Sel label="Assign Clinician" value={match.clinicianId} onChange={e => setMatch(m => ({ ...m, clinicianId:e.target.value }))}
                  options={[{ value:'', label:'Select clinician...' }, ...matchedClinicians.map(c => ({ value:c.id, label:`${c.name} · ${c.credential} · ${c.specialty}` }))]}/>
              )}
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
                <Btn onClick={() => setStep(3)} disabled={!match.practiceId}>Next: Review &amp; Send →</Btn>
              </div>
            </div>
          )}

          {step === 3 && (() => {
            const prac    = db.practices.find(p  => p.id === match.practiceId)
            const clin    = db.clinicians.find(c => c.id === match.clinicianId)
            const emp     = db.employers.find(e  => e.id === form.employerId)
            const anonId  = `LTA-${String(db.clients.length + db.referrals.length + 47).padStart(4, '0')}`
            return (
              <div>
                <div style={{ fontSize:12, color:C.textMid, marginBottom:16 }}>Step 3: Review the referral and confirm. Email + text will be ready to send.</div>
                <div style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:5, padding:16, marginBottom:16 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Referral Summary</div>
                  {[
                    ['Client ID (assigned)', anonId],
                    ['Employer', emp?.name],
                    ['Presenting Need', form.presNeed],
                    ['Session Type', form.sessionType],
                    ['Modality', form.modality === 'in-person' ? '🏢 In-Person' : '💻 Virtual'],
                    ['Client State', form.state || (form.modality === 'virtual' ? '— required for PSYPACT' : '—')],
                    ['Practice', prac?.name + ' · ' + prac?.city],
                    ['Clinician', clin ? `${clin.name} · ${clin.credential}` : 'To be assigned'],
                    ['Contact', form.clientEmail + (form.clientPhone ? ' · ' + form.clientPhone : '')],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6, paddingBottom:6, borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ color:C.textMid }}>{l}</span>
                      <span style={{ color:C.textDark, fontWeight:600, textTransform:'capitalize', textAlign:'right', maxWidth:'60%' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:`${C.tealGreen}10`, border:`1px solid ${C.tealGreen}40`, borderRadius:4, padding:'10px 12px', fontSize:12, color:C.tealDark, marginBottom:16 }}>
                  ✓ On submission: client record created, email + text message ready to copy and send.
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
                  <Btn onClick={submit} disabled={submitLoading}>{submitLoading ? 'Submitting...' : 'Submit Referral'}</Btn>
                </div>
              </div>
            )
          })()}
        </Modal>
      )}

      {/* ── Message modal ── */}
      {msgRef && (
        <Modal title={`Client Outreach — ${msgRef.anonId}`} onClose={() => setMsgModal(null)}>
          <div style={{ display:'flex', gap:0, marginBottom:14, border:`1px solid ${C.border}`, borderRadius:4, overflow:'hidden' }}>
            {[['email', '📧 Email'], ['text', '💬 Text']].map(([v, l]) => (
              <button key={v} onClick={() => setMsgTab(v)}
                style={{ flex:1, padding:'8px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Arial,sans-serif', background:msgTab === v ? C.teal : C.white, color:msgTab === v ? C.white : C.textMid, border:'none', borderRight:v === 'email' ? `1px solid ${C.border}` : 'none' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:14, fontSize:12, color:C.textDark, whiteSpace:'pre-wrap', lineHeight:1.7, marginBottom:14, maxHeight:260, overflowY:'auto', fontFamily:msgTab === 'text' ? 'Arial,sans-serif' : 'monospace' }}>
            {genMessage(msgRef, msgTab)}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={() => navigator.clipboard.writeText(genMessage(msgRef, msgTab))}>Copy {msgTab === 'email' ? 'Email' : 'Text'}</Btn>
            <Btn variant="secondary" onClick={() => setMsgModal(null)}>Done</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
