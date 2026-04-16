import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, ASSESS_BASE_URL } from '../../utils/constants'
import { mapApiError } from '../../utils/helpers'
import { useCareStore, useOrgStore } from '../../data/stores'
import { SH, Btn, Modal, ModalityBadge } from '../../components/ui'
import { TH, TD } from '../../components/ui'

const STATE_BADGE = {
  never_completed:     { label: 'Never completed',      color: '#666666' },
  due:                 { label: 'Due',                   color: '#D4721A' },
  recently_completed:  { label: 'Recently completed',    color: '#1D9E75' },
  pending:             { label: 'Pending',               color: '#8B5E00' },
}

const TYPE_META = {
  PHQ9: { label: 'PHQ-9', topic: 'Depression', max: 27 },
  GAD7: { label: 'GAD-7', topic: 'Anxiety',    max: 21 },
}

// Small inline toast/banner.
function Toast({ tone = 'info', message, onClose }) {
  if (!message) return null
  const palette = tone === 'error'
    ? { bg: '#FCE8E8', color: '#B03A3A', border: '#D9534F' }
    : tone === 'success'
    ? { bg: '#E6F4F1', color: '#1D6B6B', border: '#2A7F7F' }
    : { bg: '#FFF7E0', color: '#8B5E00', border: '#F0A500' }
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color, borderRadius: 5, padding: '10px 14px', marginBottom: 14, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: palette.color, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
      )}
    </div>
  )
}

// Single cell showing the status for one (client, type).
function StatusCell({ status, type }) {
  if (!status) return <span style={{ color: C.border, fontSize: 11 }}>—</span>
  const badge = STATE_BADGE[status.state] || STATE_BADGE.never_completed
  const typeLabel = TYPE_META[type]?.label || type

  if (status.state === 'recently_completed') {
    return (
      <div style={{ fontSize: 11, lineHeight: 1.5 }}>
        <div style={{ color: badge.color, fontWeight: 700 }}>
          {status.last_completed_at}
          {' · '}
          <span>{status.last_score}</span>
          {status.last_severity ? <span style={{ fontWeight: 400, color: C.textMid }}> ({status.last_severity})</span> : null}
        </div>
        <div style={{ fontSize: 10, color: C.textMid, marginTop: 2 }}>{typeLabel} completed within 28 days</div>
      </div>
    )
  }
  if (status.state === 'pending') {
    return (
      <div style={{ fontSize: 11, fontWeight: 600, color: badge.color, lineHeight: 1.5 }}>
        Pending — sent {status.pending_sent_at || '—'}
      </div>
    )
  }
  if (status.state === 'due') {
    return (
      <div style={{ fontSize: 11, fontWeight: 600, color: badge.color, lineHeight: 1.5 }}>
        Due{status.last_completed_at ? ` (last: ${status.last_completed_at})` : ''}
      </div>
    )
  }
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: badge.color, lineHeight: 1.5 }}>
      Never completed
    </div>
  )
}

export default function AssessmentSendView({ practiceId = null }) {
  const care = useCareStore()
  const org = useOrgStore()
  const navigate = useNavigate()

  useEffect(() => {
    org.ensureSummaryLoaded()
    care.ensureCoreLoaded()
    care.loadStatuses().catch(() => {})
  }, [org.ensureSummaryLoaded, care.ensureCoreLoaded, care.loadStatuses])

  const [sending, setSending] = useState({})     // `${clientId}:${type}` -> boolean
  const [toast, setToast] = useState(null)       // { tone, message }
  const [forbidden, setForbidden] = useState(false)
  const [sentModal, setSentModal] = useState(null) // { client, type, delivery }
  const [rowError, setRowError] = useState({})   // `${clientId}:${type}` -> message

  const inPersonBase = practiceId
    ? '/ops/practice/assessments/in-person'
    : '/ops/admin/assessments/in-person'

  const rows = useMemo(() => {
    const all = Array.isArray(care.assessmentStatuses) ? care.assessmentStatuses : []
    if (!practiceId) return all
    const clientIds = new Set(
      (care.clients || [])
        .filter((c) => c.practiceId === practiceId)
        .map((c) => c.id)
    )
    return all.filter((r) => r?.client?.id && clientIds.has(r.client.id))
  }, [care.assessmentStatuses, care.clients, practiceId])

  const clientForId = (id) => (care.clients || []).find((c) => c.id === id)

  const setRowSending = (clientId, type, v) => {
    const key = `${clientId}:${type}`
    setSending((prev) => ({ ...prev, [key]: v }))
  }

  const setRowErrorMsg = (clientId, type, msg) => {
    const key = `${clientId}:${type}`
    setRowError((prev) => {
      const next = { ...prev }
      if (msg) next[key] = msg
      else delete next[key]
      return next
    })
  }

  const handleSend = async (clientId, type) => {
    setRowSending(clientId, type, true)
    setRowErrorMsg(clientId, type, null)
    try {
      const res = await care.sendAssessment({ clientId, assessmentType: type })
      const client = clientForId(clientId)
      setSentModal({ client, type, delivery: res })
    } catch (err) {
      const mapped = mapApiError(err, {
        conflict: 'An assessment of this type is already pending for this client.',
      })
      if (mapped.kind === 'forbidden') {
        setForbidden(true)
      } else if (mapped.kind === 'conflict') {
        await care.loadStatuses({ force: true }).catch(() => {})
        setToast({ tone: 'info', message: mapped.message })
      } else if (mapped.kind === 'not_found') {
        await care.loadStatuses({ force: true }).catch(() => {})
        setRowErrorMsg(clientId, type, 'Client was not found. Statuses refreshed.')
      } else if (mapped.kind === 'validation') {
        setRowErrorMsg(clientId, type, mapped.message)
      } else {
        setToast({ tone: 'error', message: mapped.message })
      }
    } finally {
      setRowSending(clientId, type, false)
    }
  }

  const handleStartInPerson = async (clientId, type) => {
    setRowSending(clientId, type, true)
    setRowErrorMsg(clientId, type, null)
    try {
      const res = await care.startInPersonAssessment({ clientId, assessmentType: type })
      const id = res?.id || res?.assessment?.id || res?.data?.id
      if (!id) {
        setToast({ tone: 'error', message: 'In-person assessment created, but no id was returned.' })
        return
      }
      const client = clientForId(clientId)
      const params = new URLSearchParams({
        type,
        ...(client?.clientName ? { name: client.clientName } : {}),
        ...(client?.anonId ? { anon: client.anonId } : {}),
      })
      navigate(`${inPersonBase}/${id}?${params.toString()}`)
    } catch (err) {
      const mapped = mapApiError(err, {
        conflict: 'An in-person assessment is already in progress for this client.',
      })
      if (mapped.kind === 'forbidden') {
        setForbidden(true)
      } else if (mapped.kind === 'conflict') {
        await care.loadStatuses({ force: true }).catch(() => {})
        setToast({ tone: 'info', message: mapped.message })
      } else if (mapped.kind === 'validation') {
        setRowErrorMsg(clientId, type, mapped.message)
      } else {
        setToast({ tone: 'error', message: mapped.message })
      }
    } finally {
      setRowSending(clientId, type, false)
    }
  }

  if (forbidden) {
    return (
      <div>
        <SH title="Send Assessments" sub="PHQ-9 & GAD-7 · remote link or in-person" />
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 5, padding: 28, textAlign: 'center', color: C.textMid }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.textDark, marginBottom: 6 }}>You do not have access</div>
          <div style={{ fontSize: 13 }}>Your account lacks permission to send assessments. Contact an admin.</div>
        </div>
      </div>
    )
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Send Assessments" sub="PHQ-9 & GAD-7 · remote link or in-person" />

      <Toast tone={toast?.tone} message={toast?.message} onClose={() => setToast(null)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: `${C.teal}0d`, border: `1px solid ${C.teal}35`, borderRadius: 5, padding: '12px 14px', fontSize: 12, color: C.tealDark, lineHeight: 1.7 }}>
          <strong>💻 Remote clients:</strong> Click <strong>Send</strong> — we email the client a unique, single-use link. Status updates automatically when they submit.
        </div>
        <div style={{ background: `${C.tealGreen}0d`, border: `1px solid ${C.tealGreen}35`, borderRadius: 5, padding: '12px 14px', fontSize: 12, color: C.tealDark, lineHeight: 1.7 }}>
          <strong>🏢 In-person clients:</strong> Click <strong>Start</strong> to open the form in a dedicated page. Hand device to client or complete together. Score saves on submit.
        </div>
      </div>

      {care.statusesLoading && rows.length === 0 && (
        <div style={{ ...card, padding: 24, textAlign: 'center', color: C.textMid, fontSize: 13 }}>Loading assessment statuses…</div>
      )}

      {!care.statusesLoading && care.statusesError && rows.length === 0 && (
        <div style={{ ...card, padding: 24 }}>
          <Toast tone="error" message={care.statusesError} />
          <div style={{ textAlign: 'center' }}>
            <Btn onClick={() => care.loadStatuses({ force: true })}>Retry</Btn>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ ...card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {['Client', 'Practice / Modality', 'PHQ-9', 'GAD-7', 'Actions'].map((h, i) => (
                  <th key={i} style={{ ...TH, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const client = clientForId(row?.client?.id) || row.client || {}
                const prac = (org.practices || []).find((p) => p.id === client.practiceId)
                const phq = row.phq9
                const gad = row.gad7
                const phqKey = `${client.id}:PHQ9`
                const gadKey = `${client.id}:GAD7`
                const phqPending = phq?.state === 'pending'
                const gadPending = gad?.state === 'pending'
                return (
                  <tr key={client.id || i} style={{ background: i % 2 === 1 ? C.bgPage : C.white }}>
                    <td style={TD(false)}>
                      <div style={{ fontWeight: 600, color: C.textDark }}>{client.clientName || row?.client?.client_name || <span style={{ color: C.border }}>—</span>}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: C.teal, marginTop: 2 }}>{client.anonId || row?.client?.anon_id}</div>
                    </td>
                    <td style={{ ...TD(false), fontSize: 12 }}>
                      <div>{prac?.name || '—'}</div>
                      <ModalityBadge modality={client.modality} />
                    </td>
                    <td style={TD(false)}>
                      <StatusCell status={phq} type="PHQ9" />
                      {rowError[phqKey] && <div style={{ fontSize: 10, color: '#B03A3A', marginTop: 4 }}>{rowError[phqKey]}</div>}
                    </td>
                    <td style={TD(false)}>
                      <StatusCell status={gad} type="GAD7" />
                      {rowError[gadKey] && <div style={{ fontSize: 10, color: '#B03A3A', marginTop: 4 }}>{rowError[gadKey]}</div>}
                    </td>
                    <td style={TD(false)}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <Btn
                          variant="primary"
                          small
                          disabled={!!sending[phqKey] || phqPending}
                          onClick={() => handleSend(client.id, 'PHQ9')}
                        >
                          {phqPending ? 'PHQ-9 pending' : '📧 Send PHQ-9'}
                        </Btn>
                        <Btn
                          variant="primary"
                          small
                          disabled={!!sending[gadKey] || gadPending}
                          onClick={() => handleSend(client.id, 'GAD7')}
                        >
                          {gadPending ? 'GAD-7 pending' : '📧 Send GAD-7'}
                        </Btn>
                        {client.modality === 'in-person' && (
                          <>
                            <Btn
                              variant="ghost"
                              small
                              disabled={!!sending[phqKey]}
                              onClick={() => handleStartInPerson(client.id, 'PHQ9')}
                            >
                              Start PHQ-9
                            </Btn>
                            <Btn
                              variant="ghost"
                              small
                              disabled={!!sending[gadKey]}
                              onClick={() => handleStartInPerson(client.id, 'GAD7')}
                            >
                              Start GAD-7
                            </Btn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!care.statusesLoading && rows.length === 0 && !care.statusesError && (
        <div style={{ ...card, padding: 24, textAlign: 'center', color: C.textMid, fontSize: 13 }}>No active clients to assess yet.</div>
      )}

      {sentModal && (() => {
        const { client, type, delivery } = sentModal
        const channel = delivery?.channel || 'email'
        const status = delivery?.status || 'sent'
        const sentAt = delivery?.sent_at || delivery?.sentAt || new Date().toISOString()
        const link = delivery?.link || delivery?.url || `${ASSESS_BASE_URL}/assessments/${delivery?.token || ''}`
        return (
          <Modal title={`${TYPE_META[type]?.label || type} link sent`} onClose={() => setSentModal(null)}>
            <div style={{ background: `${C.tealGreen}0d`, border: `1px solid ${C.tealGreen}35`, borderRadius: 4, padding: '9px 12px', fontSize: 12, color: C.tealDark, marginBottom: 14, lineHeight: 1.6 }}>
              The email has been sent to the client. Their status will update to <strong>Pending</strong> until they submit.
            </div>
            <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 8, columnGap: 12, fontSize: 12, color: C.textDark, margin: 0 }}>
              <dt style={{ color: C.textMid }}>Assessment</dt>
              <dd style={{ margin: 0, fontWeight: 600 }}>{TYPE_META[type]?.label} · {TYPE_META[type]?.topic}</dd>
              <dt style={{ color: C.textMid }}>Client</dt>
              <dd style={{ margin: 0 }}>{client?.clientName || client?.client_name || '—'} <span style={{ color: C.textMid, fontFamily: 'monospace' }}>({client?.anonId || client?.anon_id || '—'})</span></dd>
              <dt style={{ color: C.textMid }}>Email</dt>
              <dd style={{ margin: 0 }}>{client?.email || <span style={{ color: '#B03A3A' }}>no email on file</span>}</dd>
              <dt style={{ color: C.textMid }}>Channel</dt>
              <dd style={{ margin: 0 }}>{channel}</dd>
              <dt style={{ color: C.textMid }}>Status</dt>
              <dd style={{ margin: 0, color: C.tealGreen, fontWeight: 700 }}>{status}</dd>
              <dt style={{ color: C.textMid }}>Sent at</dt>
              <dd style={{ margin: 0, fontFamily: 'monospace' }}>{sentAt}</dd>
            </dl>
            {link && (
              <div style={{ marginTop: 14, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 4, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: C.textDark, wordBreak: 'break-all' }}>{link}</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(link)}
                  style={{ flexShrink: 0, background: 'none', border: `1px solid ${C.border}`, borderRadius: 3, padding: '3px 8px', fontSize: 11, color: C.teal, cursor: 'pointer', fontFamily: 'Arial,sans-serif' }}
                >
                  Copy Link
                </button>
              </div>
            )}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Btn onClick={() => setSentModal(null)}>Done</Btn>
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
