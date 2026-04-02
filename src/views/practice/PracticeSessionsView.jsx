import React, { useEffect, useMemo, useState } from 'react'
import { C } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { useCareStore, useOrgStore } from '../../data/stores'
import { SH, Btn, Sel, Modal, ConfirmModal, ModalityBadge } from '../../components/ui'
import { TH, TD } from '../../components/ui'

const sessionErrorMessage = (err, fallback) => {
  const message = err?.message?.trim()
  if (message && !['Bad Request', 'Forbidden', 'Not Found', 'Internal Server Error'].includes(message)) {
    return message
  }
  if (err?.status === 400) return 'session can only be deleted on the day it was created'
  if (err?.status === 403) return 'Forbidden'
  if (err?.status === 404) return 'session not found'
  if (err?.status === 500) return message || 'Internal Server Error'
  return message || fallback
}

async function fetchAllCliniciansForPractice(loadPage, practiceId) {
  if (!practiceId) return []
  const pageSize = 100
  let page = 1
  let totalPages = 1
  const all = []
  while (page <= totalPages) {
    const res = await loadPage({ practiceId, page, limit: pageSize })
    const items = res?.items || []
    all.push(...items)
    totalPages = res?.pagination?.total_pages || 1
    page += 1
  }
  return all
}

export default function PracticeSessionsView({ practiceId }) {
  const org = useOrgStore()
  const care = useCareStore()
  const db = {
    practices: org.practices,
    employers: org.employers,
    clients: care.clients,
    sessions: care.sessions,
  }

  useEffect(() => {
    org.ensureSummaryLoaded()
    care.ensureCoreLoaded()
  }, [org.ensureSummaryLoaded, care.ensureCoreLoaded])

  const [practiceClinicians, setPracticeClinicians] = useState([])
  useEffect(() => {
    if (!practiceId) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchAllCliniciansForPractice(org.load_clinicians_page, practiceId)
        if (!cancelled) setPracticeClinicians(rows)
      } catch {
        if (!cancelled) setPracticeClinicians([])
      }
    })()
    return () => { cancelled = true }
  }, [practiceId])

  const [modal, setModal] = useState(false)
  const [apiError, setApiError] = useState('')
  const [modalError, setModalError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [confirmSessionId, setConfirmSessionId] = useState('')
  const [form, setForm]   = useState({
    clientId:'', clinicianId:'', employerId:'',
    date:'', type:'individual', modality:'in-person', feeCents:'',
  })

  const myClients = useMemo(
    () => (db.clients || []).filter((c) => c.practiceId === practiceId),
    [db.clients, practiceId]
  )
  const mySessions = useMemo(
    () => (db.sessions || []).filter((s) => s.practiceId === practiceId),
    [db.sessions, practiceId]
  )

  const getRate = (type) => {
    const p = db.practices.find((x) => x.id === practiceId)
    if (!p) return ''
    const r = { individual: p.rateIndividual, couple: p.rateCouple, psychiatry: p.ratePsychiatry }[type]
    return r ? String(r / 100) : ''
  }

  const pickClient = (clientId) => {
    const c = myClients.find((x) => x.id === clientId)
    if (!c) return
    const fee = getRate(form.type)
    setForm((f) => ({
      ...f,
      clientId,
      clinicianId: c.clinicianId || '',
      employerId: c.employerId,
      modality: c.modality || 'in-person',
      feeCents: fee,
    }))
  }

  const changeType = (type) => {
    const fee = getRate(type)
    setForm((f) => ({ ...f, type, feeCents: fee }))
  }

  const resetForm = () => {
    setForm({ clientId:'', clinicianId:'', employerId:'', date:'', type:'individual', modality:'in-person', feeCents:'' })
  }

  const openLogModal = () => {
    setModalError('')
    setModal(true)
  }

  const closeLogModal = () => {
    setModal(false)
    setModalError('')
  }

  const addSession = async () => {
    const raw = form.feeCents.trim()
    let feeCents
    if (raw !== '') {
      const n = Math.round(parseFloat(raw) * 100)
      feeCents = Number.isFinite(n) ? n : undefined
    }
    try {
      setSubmitLoading(true)
      await care.addSession({
        ...form,
        practiceId,
        ...(feeCents !== undefined ? { feeCents } : {}),
      })
      setModalError('')
      setModal(false)
      resetForm()
    } catch (e) {
      setModalError(sessionErrorMessage(e, 'Failed to log session.'))
    } finally {
      setSubmitLoading(false)
    }
  }

  const askDeleteSession = (id) => {
    setConfirmSessionId(id)
  }

  const confirmDeleteSession = async () => {
    if (!confirmSessionId) return
    try {
      setDeletingId(confirmSessionId)
      await care.deleteSession(confirmSessionId)
      setApiError('')
    } catch (e) {
      setApiError(sessionErrorMessage(e, 'Failed to delete session.'))
    } finally {
      setDeletingId('')
      setConfirmSessionId('')
    }
  }

  const sorted = [...mySessions].sort((a, b) => b.date.localeCompare(a.date))
  const prac = db.practices.find((p) => p.id === practiceId)
  const rateHint = prac ? `Practice rate: ${fmt(prac.rateIndividual || 0)} / ${fmt(prac.rateCouple || 0)} / ${fmt(prac.ratePsychiatry || 0)} (individual / couples / psych)` : null
  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="My Sessions" sub={`${mySessions.length} total logged`} action={<Btn onClick={openLogModal}>+ Log Session</Btn>} />

      {apiError && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'10px 14px', color:'#B03A3A', fontSize:12, marginBottom:12 }}>
          {apiError}
        </div>
      )}

      <div style={card}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {[['Date'], ['Client'], ['Employer'], ['Type'], ['Modality'], ['Fee', true], ['Actions', true]].map(([h, r], i) => (
                <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const cl = db.clients.find((c) => c.id === s.clientId)
              const emp = db.employers.find((e) => e.id === s.employerId)
              return (
                <tr key={s.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white }}>
                  <td style={{ ...TD(false), fontFamily:'monospace', fontSize:12, color:C.textMid }}>{s.date}</td>
                  <td style={TD(false)}><span style={{ fontFamily:'monospace', color:C.teal, fontWeight:700, fontSize:12 }}>{cl?.clientName}</span></td>
                  <td style={{ ...TD(false), fontSize:13 }}>{emp?.name}</td>
                  <td style={{ ...TD(false), textTransform:'capitalize', color:C.textMid, fontSize:13 }}>{s.type}</td>
                  <td style={TD(false)}><ModalityBadge modality={s.modality} /></td>
                  <td style={{ ...TD(true), fontFamily:'monospace', color:C.tealDark, fontWeight:700 }}>{fmt(s.feeCents)}</td>
                  <td style={TD(true)}>
                    <Btn
                      small
                      variant="ghost"
                      onClick={() => askDeleteSession(s.id)}
                      disabled={deletingId === s.id || submitLoading}
                    >
                      {deletingId === s.id ? 'Deleting...' : 'Delete'}
                    </Btn>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Log Session" onClose={closeLogModal}>
          {modalError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'10px 14px', color:'#B03A3A', fontSize:12, marginBottom:12 }}>
              {modalError}
            </div>
          )}
          <Sel label="Client" value={form.clientId} onChange={(e) => pickClient(e.target.value)}
            options={[{ value:'', label:'Select client...' }, ...myClients.map((c) => ({ value:c.id, label:c.clientName }))]} />
          {form.employerId && (
            <div style={{ fontSize:12, color:C.textMid, marginTop:-8, marginBottom:12 }}>
              Employer: {db.employers.find((e) => e.id === form.employerId)?.name}
            </div>
          )}
          <Sel
            label="Clinician"
            value={form.clinicianId}
            onChange={(e) => setForm((f) => ({ ...f, clinicianId: e.target.value }))}
            options={[
              { value: '', label: practiceClinicians.length ? 'Select clinician...' : 'No clinicians loaded — add clinicians first' },
              ...practiceClinicians
                .filter((cl) => cl.active !== false)
                .map((cl) => ({
                  value: cl.id,
                  label: [cl.name, cl.credential, cl.specialty].filter(Boolean).join(' · '),
                })),
            ]}
          />
          <Sel label="Session Type" value={form.type} onChange={(e) => changeType(e.target.value)}
            options={[
              { value:'individual', label:'Individual Therapy' },
              { value:'couple', label:'Couples Therapy' },
              { value:'psychiatry', label:'Psychiatry' },
            ]} />

          <div style={{ marginBottom:13 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Session Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date:e.target.value }))}
              style={{ width:'100%', boxSizing:'border-box', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', outline:'none' }} />
          </div>

          <div style={{ marginBottom:13 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Modality</label>
            <div style={{ display:'flex', gap:0, border:`1px solid ${C.border}`, borderRadius:4, overflow:'hidden' }}>
              {[['in-person', 'In-Person'], ['virtual', 'Virtual']].map(([v, l]) => (
                <button key={v} onClick={() => setForm((f) => ({ ...f, modality:v }))}
                  style={{ flex:1, padding:'9px 0', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Arial,sans-serif', border:'none', background:form.modality === v ? C.teal : C.white, color:form.modality === v ? C.white : C.textMid, borderRight:v === 'in-person' ? `1px solid ${C.border}` : 'none' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:13 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Session Fee ($) — optional</label>
            <input type="number" value={form.feeCents} onChange={(e) => setForm((f) => ({ ...f, feeCents:e.target.value }))}
              style={{ width:'100%', boxSizing:'border-box', border:`1px solid ${form.feeCents && parseFloat(form.feeCents) > 0 ? C.teal : C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', outline:'none' }} />
            {rateHint && <div style={{ fontSize:11, color:C.tealDark, marginTop:5 }}>{rateHint} · Leave blank to use the practice rate for this session type.</div>}
          </div>

          <Btn onClick={addSession} disabled={!form.clientId || !form.clinicianId || !form.date || submitLoading}>
            {submitLoading ? 'Logging...' : 'Log Session'}
          </Btn>
        </Modal>
      )}

      <ConfirmModal
        open={Boolean(confirmSessionId)}
        title="Delete Session"
        message="Delete this session? It can only be deleted on the same UTC day it was created."
        confirmLabel="Delete"
        onCancel={() => setConfirmSessionId('')}
        onConfirm={confirmDeleteSession}
        busy={deletingId === confirmSessionId}
      />
    </div>
  )
}
