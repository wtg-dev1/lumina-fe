import React, { useEffect, useMemo, useRef, useState } from 'react'
import { C } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { useCareStore, useFinanceStore, useOrgStore } from '../../data/stores'
import { SH, Btn, Inp, Sel, Modal, ConfirmModal } from '../../components/ui'

export default function PracticesView() {
  const org = useOrgStore()
  const care = useCareStore()
  const finance = useFinanceStore()
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const prevDebouncedQRef = useRef(debouncedQ)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(searchInput.trim()), 500)
    return () => clearTimeout(id)
  }, [searchInput])

  const listPractices = useMemo(() => (
    org.practices_page_items.map((row) => ({
      ...row,
      ...(org.practices.find((p) => p.id === row.id) || {}),
    }))
  ), [org.practices_page_items, org.practices])

  const db = {
    practices: listPractices,
    clinicians: org.clinicians,
    contracts: org.contracts,
    employers: org.employers,
    sessions: care.sessions,
    payouts: finance.payouts,
  }
  const [apiError, setApiError] = useState('')
  const [addPracticeError, setAddPracticeError] = useState('')
  const [ratesError, setRatesError] = useState('')
  const [contractError, setContractError] = useState('')
  const [clinicianError, setClinicianError] = useState('')
  const [confirmClinicianDelete, setConfirmClinicianDelete] = useState(null)
  const [deletingClinicianId, setDeletingClinicianId] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        await org.ensureDetailsLoaded()
        await care.ensureCoreLoaded()
        await finance.ensureSummaryLoaded()
      } catch (e) {
        setApiError(e?.message || 'Failed loading practice data.')
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const qChanged = prevDebouncedQRef.current !== debouncedQ
        prevDebouncedQRef.current = debouncedQ
        const effectivePage = qChanged ? 1 : page
        if (qChanged && page !== 1) setPage(1)
        await org.load_practices_page({
          page: effectivePage,
          limit,
          q: debouncedQ || undefined,
        })
      } catch (e) {
        setApiError(e?.message || 'Failed loading practice data.')
      }
    })()
  }, [page, limit, debouncedQ])

  const [modal, setModal]   = useState(false)
  const [cModal, setCModal] = useState(null)  // practiceId for add-contract modal
  const [rModal, setRModal] = useState(null)  // practiceId for set-rates modal
  const [clModal, setClModal] = useState(null) // { mode, practiceId, clinician }
  const [form, setForm]     = useState({ name:'', contact:'', email:'', city:'' })
  const [cForm, setCForm]   = useState({ employer_id:'', type:'per_employee', billing_model:'pay_as_you_go', rate_cents:'', units:'', margin_percent:'20', effective_date:'' })
  const [rForm, setRForm]   = useState({ rateIndividual:'', rateCouple:'', ratePsychiatry:'' })
  const [clForm, setClForm] = useState({ name:'', credential:'', specialty:'', active:'true' })

  const openRates = (prac) => {
    setRatesError('')
    setRForm({
      rateIndividual: String((prac.rateIndividual || 0) / 100),
      rateCouple:     String((prac.rateCouple     || 0) / 100),
      ratePsychiatry: String((prac.ratePsychiatry || 0) / 100),
    })
    setRModal(prac.id)
  }

  const saveRates = async () => {
    setRatesError('')
    try {
      await org.updatePractice({
      id:             rModal,
      rate_individual: Math.round(parseFloat(rForm.rateIndividual || 0) * 100),
      rate_couple: Math.round(parseFloat(rForm.rateCouple || 0) * 100),
      rate_psychiatry: Math.round(parseFloat(rForm.ratePsychiatry || 0) * 100),
    })
      setRModal(null)
    } catch (e) {
      setRatesError(e?.message || 'Failed to update rates.')
    }
  }

  const addPractice = () => {
    setAddPracticeError('')
    org.addPractice({
      name: form.name, contact_name: form.contact, contact_email: form.email, city: form.city,
    }).then(() => {
      setModal(false)
      setForm({ name:'', contact:'', email:'', city:'' })
    }).catch((e) => setAddPracticeError(e?.message || 'Failed to add practice.'))
  }

  const formatApiError = (e, fallback) => {
    if (Array.isArray(e?.data?.errors) && e.data.errors.length > 0) {
      return e.data.errors.map((msg) => String(msg)).join(' - ')
    }
    return e?.message || fallback
  }

  const openAddClinician = (practiceId) => {
    setClinicianError('')
    setClForm({ name:'', credential:'', specialty:'', active:'true' })
    setClModal({ mode: 'create', practiceId, clinician: null })
  }

  const openEditClinician = (practiceId, clinician) => {
    setClinicianError('')
    setClForm({
      name: clinician?.name || '',
      credential: clinician?.credential || '',
      specialty: clinician?.specialty || '',
      active: String(clinician?.active !== false),
    })
    setClModal({ mode: 'edit', practiceId, clinician })
  }

  const saveClinician = async () => {
    setClinicianError('')
    const payload = {
      practice_id: clModal.practiceId,
      name: clForm.name.trim(),
      credential: clForm.credential.trim(),
      specialty: clForm.specialty.trim(),
    }
    try {
      if (clModal.mode === 'edit') {
        await org.updateClinician({
          ...payload,
          id: clModal.clinician.id,
          active: clForm.active === 'true',
        })
      } else {
        await org.addClinician(payload)
      }
      setClModal(null)
    } catch (e) {
      setClinicianError(formatApiError(e, `Failed to ${clModal.mode === 'edit' ? 'update' : 'add'} clinician.`))
    }
  }

  const askDeleteClinician = ({ practiceId, clinicianId }) => {
    setConfirmClinicianDelete({ practiceId, clinicianId })
  }

  const confirmDeleteClinician = async () => {
    if (!confirmClinicianDelete) return
    setApiError('')
    try {
      setDeletingClinicianId(confirmClinicianDelete.clinicianId)
      await org.deleteClinician({
        practice_id: confirmClinicianDelete.practiceId,
        id: confirmClinicianDelete.clinicianId,
      })
    } catch (e) {
      setApiError(formatApiError(e, 'Failed to delete clinician.'))
    } finally {
      setDeletingClinicianId('')
      setConfirmClinicianDelete(null)
    }
  }

  const addContract = async () => {
    const labels = {
      per_employee:         `$${cForm.rate_cents}/mo per employee`,
      per_couple:           `$${cForm.rate_cents}/mo per couple`,
      per_psychiatry_block: `$${cForm.rate_cents}/mo per 2-session block`,
    }
    setContractError('')
    if (cForm.billing_model === 'pre_paid_package' && !cForm.units) {
      setContractError('Units is required for pre-paid package contracts.')
      return
    }
    if (cForm.billing_model === 'pay_as_you_go' && cForm.units) {
      setContractError('Units must not be set for pay-as-you-go contracts.')
      return
    }
    try {
      await org.addContract({
        practice_id: cModal,
        employer_id: cForm.employer_id,
        type: cForm.type,
        billing_model: cForm.billing_model,
        rate_cents: parseInt(cForm.rate_cents, 10) * 100,
        ...(cForm.billing_model === 'pre_paid_package'
          ? { units: parseInt(cForm.units, 10) }
          : {}),
        margin_percent: parseInt(cForm.margin_percent, 10),
        label: labels[cForm.type],
        effective_date: cForm.effective_date,
      })
      setCModal(null)
    } catch (e) {
      const msg = e?.message || ''
      if (msg.includes('units is required') || msg.includes("'Units' failed on the 'required_if'"))
        setContractError('Units is required for pre-paid package contracts.')
      else if (msg.includes('units must be null') || msg.includes("'Units' failed on the 'excluded_if'"))
        setContractError('Units must not be set for pay-as-you-go contracts.')
      else
        setContractError(msg || 'Failed to add contract.')
    }
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Practices" sub={`${org.practices_pagination.total || 0} in network`} action={
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', justifyContent:'flex-end' }}>
          <input
            type="search"
            placeholder="Search practices…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search practices"
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
          <Btn onClick={() => { setAddPracticeError(''); setModal(true) }}>+ Add Practice</Btn>
        </div>
      }/>
      {(apiError || org.error) && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
          {apiError || org.error}
        </div>
      )}
      {org.practices_error && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
          {org.practices_error}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontSize:12, color:C.textMid }}>
          Page {org.practices_pagination.page} of {org.practices_pagination.total_pages}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Btn variant="ghost" small disabled={org.practices_loading || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Btn>
          <Btn variant="ghost" small disabled={org.practices_loading || page >= (org.practices_pagination.total_pages || 1)} onClick={() => setPage((p) => Math.min(org.practices_pagination.total_pages || 1, p + 1))}>Next</Btn>
        </div>
      </div>

      <div style={{ display:'grid', gap:14 }}>
        {db.practices.map(prac => {
          const clins     = db.clinicians
            .filter(c => (c.practiceId || c.practice_id) === prac.id)
            .sort((a, b) => Number(b.active !== false) - Number(a.active !== false))
          const contracts = db.contracts.filter(c => (c.practice_id || c.practiceId) === prac.id && c.active)
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
                  <Btn variant="secondary" small onClick={() => openAddClinician(prac.id)}>+ Clinician</Btn>
                  <Btn variant="secondary" small onClick={() => { setContractError(''); setCModal(prac.id) }}>+ Contract</Btn>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:'12px 14px', marginBottom:14 }}>
                {[['Individual', prac.rate_individual || prac.rateIndividual], ['Couples', prac.rate_couple || prac.rateCouple], ['Psychiatry', prac.rate_psychiatry || prac.ratePsychiatry]].map(([l, r]) => (
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
              <div style={{ display:'grid', gap:6, marginBottom:contracts.length ? 14 : 0 }}>
                {clins.length > 0
                  ? clins.map(cl => (
                    <div key={cl.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, fontSize:12, background:C.cream, border:`1px solid ${C.border}`, color:C.textDark, padding:'6px 8px', borderRadius:3 }}>
                      <span>
                        {cl.name}
                        {cl.credential ? ` · ${cl.credential}` : ''}
                        {cl.specialty ? ` · ${cl.specialty}` : ''}
                        {cl.active === false ? ' · Inactive' : ''}
                      </span>
                      <span style={{ display:'flex', gap:6 }}>
                        <Btn variant="ghost" small onClick={() => openEditClinician(prac.id, cl)}>Edit</Btn>
                        <Btn variant="ghost" small onClick={() => askDeleteClinician({ practiceId: prac.id, clinicianId: cl.id })}>Delete</Btn>
                      </span>
                    </div>
                  ))
                  : (
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:12, color:C.border }}>No clinicians added yet</span>
                      <Btn variant="ghost" small onClick={() => openAddClinician(prac.id)}>Add Clinician</Btn>
                    </div>
                  )
                }
              </div>

              {contracts.length > 0 && (
                <div style={{ paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7 }}>Contracts</div>
                  {contracts.map(c => (
                    <div key={c.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.textMid, marginBottom:3 }}>
                      <span>{db.employers.find(e => e.id === (c.employer_id || c.employerId))?.name}</span>
                      <span style={{ fontFamily:'monospace', color:C.textDark }}>
                        {c.label}
                        {' · '}
                        {c.billing_model === 'pre_paid_package'
                          ? `pre-paid · ${c.units} units`
                          : 'pay-as-you-go'}
                        {` · ${c.margin_percent || c.margin}% margin`}
                      </span>
                      <span style={{display:'flex',gap:6}}>
                        <Btn variant="ghost" small onClick={async () => {
                          setApiError('')
                          try {
                            await org.setContractActive({ practice_id: prac.id, id: c.id, active: !c.active })
                          } catch (e) {
                            setApiError(e?.message || 'Failed to update contract status.')
                          }
                        }}>{c.active ? 'Deactivate' : 'Activate'}</Btn>
                        <Btn variant="ghost" small onClick={async () => {
                          setApiError('')
                          try {
                            await org.deleteContract({ practice_id: prac.id, id: c.id })
                          } catch (e) {
                            setApiError(e?.message || 'Failed to delete contract.')
                          }
                        }}>Delete</Btn>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title="Add Practice" onClose={() => { setModal(false); setAddPracticeError('') }}>
          {addPracticeError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
              {addPracticeError}
            </div>
          )}
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
          <Modal title={`Session Rates — ${prac?.name}`} onClose={() => { setRModal(null); setRatesError('') }}>
            {ratesError && (
              <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
                {ratesError}
              </div>
            )}
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
        <Modal title="Add Contract" onClose={() => { setCModal(null); setContractError('') }}>
          {contractError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
              {contractError}
            </div>
          )}
          <Sel label="Employer" value={cForm.employer_id} onChange={e => setCForm(f => ({ ...f, employer_id:e.target.value }))}
            options={[{ value:'', label:'Select employer...' }, ...db.employers.map(e => ({ value:e.id, label:e.name }))]}/>
          <Sel label="Contract Type" value={cForm.type} onChange={e => setCForm(f => ({ ...f, type:e.target.value }))}
            options={[
              { value:'per_employee',         label:'Per Employee / Month' },
              { value:'per_couple',           label:'Per Couple / Month' },
              { value:'per_psychiatry_block', label:'Per Psychiatry Block / Month' },
            ]}/>
          <Sel label="Billing Model" value={cForm.billing_model}
            onChange={e => setCForm(f => ({ ...f, billing_model: e.target.value, units: '' }))}
            options={[
              { value: 'pay_as_you_go',    label: 'Pay-as-you-go' },
              { value: 'pre_paid_package', label: 'Pre-paid package' },
            ]}/>
          <Inp label="Rate ($)"          type="number" value={cForm.rate_cents}   onChange={e => setCForm(f => ({ ...f, rate_cents:e.target.value }))}   placeholder="1000"/>
          {cForm.billing_model === 'pre_paid_package' && (
            <Inp label="Units" type="number" min="1" value={cForm.units} onChange={e => setCForm(f => ({ ...f, units:e.target.value }))} placeholder="12"/>
          )}
          <Inp label="Lumina Margin (%)" type="number" value={cForm.margin_percent} onChange={e => setCForm(f => ({ ...f, margin_percent:e.target.value }))} placeholder="20"/>
          <Inp label="Effective Date" type="date" value={cForm.effective_date} onChange={e => setCForm(f => ({ ...f, effective_date:e.target.value }))}/>
          <Btn onClick={addContract} disabled={!cForm.employer_id || !cForm.rate_cents || !cForm.effective_date}>Add Contract</Btn>
        </Modal>
      )}

      {clModal && (() => {
        const practiceName = db.practices.find((p) => p.id === clModal.practiceId)?.name
        const editing = clModal.mode === 'edit'
        return (
          <Modal title={`${editing ? 'Edit' : 'Add'} Clinician — ${practiceName || ''}`} onClose={() => { setClModal(null); setClinicianError('') }}>
            {clinicianError && (
              <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
                {clinicianError}
              </div>
            )}
            <Inp label="Clinician Name" value={clForm.name} onChange={e => setClForm(f => ({ ...f, name:e.target.value }))} placeholder="Dr. Jane Smith"/>
            <Inp label="Credential (optional)" value={clForm.credential} onChange={e => setClForm(f => ({ ...f, credential:e.target.value }))} placeholder="LCSW"/>
            <Inp label="Specialty (optional)" value={clForm.specialty} onChange={e => setClForm(f => ({ ...f, specialty:e.target.value }))} placeholder="Anxiety"/>
            {editing && (
              <Sel
                label="Status"
                value={clForm.active}
                onChange={e => setClForm(f => ({ ...f, active:e.target.value }))}
                options={[
                  { value:'true', label:'Active' },
                  { value:'false', label:'Inactive' },
                ]}
              />
            )}
            <Btn onClick={saveClinician} disabled={!clForm.name.trim()}>{editing ? 'Save Changes' : 'Add Clinician'}</Btn>
          </Modal>
        )
      })()}

      <ConfirmModal
        open={Boolean(confirmClinicianDelete)}
        title="Delete Clinician"
        message="Delete this clinician? This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmClinicianDelete(null)}
        onConfirm={confirmDeleteClinician}
        busy={Boolean(confirmClinicianDelete && deletingClinicianId === confirmClinicianDelete.clinicianId)}
      />
    </div>
  )
}
