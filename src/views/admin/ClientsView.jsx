import React, { useEffect, useMemo, useState } from 'react'
import { C } from '../../utils/constants'
import { useCareStore, useOrgStore } from '../../data/stores'
import { SH, Btn, Inp, Sel, Modal, Badge, Note } from '../../components/ui'
import { TH, TD } from '../../components/ui'

const CLIENTS_PAGE_SIZE = 15

export default function ClientsView({ practiceId = null }) {
  const org = useOrgStore()
  const care = useCareStore()
  const db = {
    employers: org.employers,
    practices: org.practices,
    clients: care.clients,
    assessments: care.assessments,
  }

  useEffect(() => {
    org.ensureSummaryLoaded()
    care.ensureCoreLoaded()
    care.ensureAssessmentsLoaded()
  }, [org.ensureSummaryLoaded, care.ensureCoreLoaded, practiceId, care.ensureAssessmentsLoaded])

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    clientName: '', employerId: '', practiceId: '', email: '', phone: '', status: 'active',
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [statusError, setStatusError] = useState('')
  const [statusLoadingClientId, setStatusLoadingClientId] = useState('')
  const [page, setPage] = useState(1)

  const isPracticeRoute = Boolean(practiceId)
  const filteredClients = useMemo(
    () => db.clients.filter((c) => !practiceId || c.practiceId === practiceId),
    [db.clients, practiceId]
  )

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / CLIENTS_PAGE_SIZE) || 1)

  useEffect(() => {
    setPage(1)
  }, [practiceId])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const pagedClients = useMemo(
    () => filteredClients.slice((page - 1) * CLIENTS_PAGE_SIZE, page * CLIENTS_PAGE_SIZE),
    [filteredClients, page]
  )

  const showingFrom = filteredClients.length ? (page - 1) * CLIENTS_PAGE_SIZE + 1 : 0
  const showingTo = filteredClients.length ? (page - 1) * CLIENTS_PAGE_SIZE + pagedClients.length : 0

  const resetForm = () => {
    setForm({ clientName: '', employerId: '', practiceId: '', email: '', phone: '', status: 'active' })
  }

  const addClient = async () => {
    try {
      setSubmitLoading(true)
      await care.addClient({ ...form })
      setSubmitError('')
      setModal(false)
      resetForm()
    } catch (err) {
      setSubmitError(err?.message || 'Unable to create client.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const updateClientStatus = async (id, nextStatus) => {
    try {
      setStatusLoadingClientId(id)
      await care.updateClientStatus(id, nextStatus)
      setStatusError('')
    } catch (err) {
      setStatusError(err?.message || 'Unable to update client status.')
    } finally {
      setStatusLoadingClientId('')
    }
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH
        title="Clients"
        sub={`${filteredClients.length} enrolled`}
        action={!isPracticeRoute ? <Btn onClick={() => setModal(true)}>+ Add Client</Btn> : null}
      />

      {isPracticeRoute && (
        <div style={{ ...card, padding:'10px 12px', marginBottom:12, fontSize:12, color:C.textMid }}>
          Client enrollment is admin-only. Practice users can view clients and update status.
        </div>
      )}

      {statusError && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'10px 14px', color:'#B03A3A', fontSize:12, marginBottom:12 }}>
          {statusError}
        </div>
      )}

      <div style={card}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {[['Name'], ['Anon ID'], ['Employer'], ['Practice'], ['Email'], ['Phone'], ['Intake'], ['Status'], ['Assess.', true], ['Actions', true]].map(([h, r], i) => (
                <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ ...TD(false), color: C.textMid, fontSize: 12 }}>
                  {isPracticeRoute ? 'No clients assigned to this practice.' : 'No clients enrolled yet.'}
                </td>
              </tr>
            ) : (
              pagedClients.map((c, i) => {
                const emp  = db.employers.find(e => e.id === c.employerId)
                const prac = db.practices.find(p => p.id === c.practiceId)
                const lastAssess = db.assessments
                  .filter(a => a.clientId === c.id)
                  .sort((a, b) => b.date.localeCompare(a.date))[0]
                const daysSince  = lastAssess ? Math.floor((new Date() - new Date(lastAssess.date)) / (1000 * 60 * 60 * 24)) : null
                const assessDue  = daysSince === null || daysSince >= 28
                const nextStatus = c.status === 'active' ? 'discharged' : 'active'

                return (
                  <tr key={c.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white }}>
                    <td style={{ ...TD(false), fontWeight:600 }}>{c.clientName || <span style={{ color:C.border }}>—</span>}</td>
                    <td style={TD(false)}><span style={{ fontFamily:'monospace', color:C.teal, fontWeight:700, fontSize:11 }}>{c.anonId}</span></td>
                    <td style={TD(false)}>{emp?.name}</td>
                    <td style={TD(false)}>{prac?.name}</td>
                    <td style={TD(false)}>{c.email || '—'}</td>
                    <td style={TD(false)}>{c.phone || '—'}</td>
                    <td style={{ ...TD(false), fontFamily:'monospace', fontSize:11, color:C.textMid }}>{c.intakeDate}</td>
                    <td style={TD(false)}><Badge status={c.status}/></td>
                    <td style={TD(true)}>
                      <span style={{ fontSize:11, fontFamily:'monospace', color:assessDue ? '#D4721A' : C.tealGreen, fontWeight:700 }}>
                        {assessDue ? 'DUE' : daysSince !== null ? `${daysSince}d ago` : '—'}
                      </span>
                    </td>
                    <td style={TD(true)}>
                      <Btn
                        small
                        variant="ghost"
                        onClick={() => updateClientStatus(c.id, nextStatus)}
                        disabled={statusLoadingClientId === c.id || submitLoading}
                      >
                        {statusLoadingClientId === c.id
                          ? 'Saving...'
                          : nextStatus === 'discharged'
                            ? 'Discharge'
                            : 'Set Active'}
                      </Btn>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredClients.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 10 }}>
          <div style={{ fontSize: 12, color: C.textMid }}>
            Page <strong style={{ color: C.textDark }}>{page}</strong> of <strong style={{ color: C.textDark }}>{totalPages}</strong>
            <span style={{ marginLeft: 8 }}>
              · Showing <strong style={{ color: C.textDark }}>{showingFrom}–{showingTo}</strong> of{' '}
              <strong style={{ color: C.textDark }}>{filteredClients.length}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" small onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Prev
            </Btn>
            <Btn variant="secondary" small onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Next
            </Btn>
          </div>
        </div>
      )}

      {modal && (
        <Modal title="Add Client" onClose={() => setModal(false)}>
          <Note>Name visible to Lumina admin and assigned practice only. Employers always see anonymous ID.</Note>
          {submitError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'10px 14px', color:'#B03A3A', fontSize:12, marginBottom:12 }}>
              {submitError}
            </div>
          )}
          <Inp label="Client Full Name" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName:e.target.value }))} placeholder="First Last"/>
          <Sel label="Employer" value={form.employerId} onChange={e => setForm(f => ({ ...f, employerId:e.target.value }))}
            options={[{ value:'', label:'Select...' }, ...db.employers.map(e => ({ value:e.id, label:e.name }))]}/>
          <Sel label="Practice" value={form.practiceId} onChange={e => setForm(f => ({ ...f, practiceId:e.target.value }))}
            options={[{ value:'', label:'Select...' }, ...db.practices.map(p => ({ value:p.id, label:p.name }))]}/>
          <Inp label="Client Email (for assessments)" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))}/>
          <Inp label="Client Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone:e.target.value }))}/>
          <Sel
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'discharged', label: 'Discharged' },
            ]}
          />
          <Btn onClick={addClient} disabled={!form.employerId || !form.practiceId || submitLoading}>
            {submitLoading ? 'Enrolling...' : 'Enroll Client'}
          </Btn>
        </Modal>
      )}
    </div>
  )
}
