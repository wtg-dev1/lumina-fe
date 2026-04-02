import React, { useEffect, useState } from 'react'
import { C, ASSESS_BASE_URL } from '../../utils/constants'
import { useCareStore, useOrgStore } from '../../data/stores'
import { SH, Btn, Modal, ModalityBadge } from '../../components/ui'
import { TH, TD } from '../../components/ui'
import AssessmentForm from '../../components/AssessmentForm'

export default function AssessmentSendView({ practiceId = null }) {
  const care = useCareStore()
  const org = useOrgStore()
  const db = {
    clients: care.clients,
    assessments: care.assessments,
    practices: org.practices,
  }

  useEffect(() => {
    org.ensureSummaryLoaded()
    care.ensureCoreLoaded()
    care.ensureAssessmentsLoaded()
  }, [org.ensureSummaryLoaded, care.ensureCoreLoaded, care.ensureAssessmentsLoaded])

  const [activeForm, setActiveForm] = useState(null)  // { clientId, type, token } — in-person
  const [msgModal,   setMsgModal]   = useState(null)  // { client, type, token }
  const [tab,        setTab]        = useState('email')
  const [starting,  setStarting]  = useState(false)

  const visibleClients = practiceId
    ? db.clients.filter(c => c.practiceId === practiceId && c.status === 'active')
    : db.clients.filter(c => c.status === 'active')

  const lastCompleted = (clientId, type) =>
    db.assessments
      .filter(a => a.clientId === clientId && a.type === type && a.completed === true && a.score !== null)
      .sort((a, b) => b.date.localeCompare(a.date))[0] || null

  const pendingAssess = (clientId, type) =>
    db.assessments
      .filter(a => a.clientId === clientId && a.type === type && a.completed === false && a.token)
      .sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))[0] || null

  const daysSince = (d) => d ? Math.floor((new Date() - new Date(d)) / (1000 * 60 * 60 * 24)) : null

  const getStatus = (clientId, type) => {
    const pending = pendingAssess(clientId, type)
    if (pending) return { label:`⏳ Sent ${pending.sentAt || '—'} · awaiting response`, color:'#8B5E00', pending:true }
    const last = lastCompleted(clientId, type)
    if (!last) return { label:'⚠ Never completed', color:'#D4721A', due:true }
    const days = daysSince(last.date)
    if (days >= 28) return { label:`⚠ Due (last: ${last.date})`, color:'#D4721A', due:true }
    return { label:`✓ ${days}d ago · score ${last.score}`, color:C.tealGreen, due:false }
  }

  const createToken = async (clientId, type) => {
    const tokenFromBackend = await care.sendAssessment({ clientId, type })
    if (typeof tokenFromBackend === 'string' && tokenFromBackend) return tokenFromBackend
    throw new Error('Could not create assessment link.')
  }

  const handleFormSubmit = (answers, score) => {
    care.completeAssessment({
      clientId: activeForm.clientId,
      type:     activeForm.type,
      token:    activeForm.token,
      answers, score,
    })
    setTimeout(() => setActiveForm(null), 3500)
  }

  const genEmail = (c, type, token) => {
    const link     = `${ASSESS_BASE_URL}/assess/${token}`
    const name     = c.clientName || 'there'
    const typeName = type === 'PHQ9' ? 'PHQ-9 (depression screening, 9 questions)' : 'GAD-7 (anxiety screening, 7 questions)'
    return {
      subject: `Your ${type === 'PHQ9' ? 'Depression' : 'Anxiety'} Check-In — Lumina Therapy Alliance`,
      body: `Hello ${name},\n\nAs part of your mental health care through Lumina Therapy Alliance, we ask that you complete a brief ${typeName} every four weeks. This takes about 2 minutes and helps your clinician track your progress.\n\nPlease complete your assessment here:\n${link}\n\nThis link is private and unique to you. It will work on your phone, tablet, or computer. Your responses are confidential and will only be shared with your clinician and care coordinator.\n\nIf you have any questions or concerns, please contact us:\nEmail: drselling@luminatherapyalliance.com\nPhone: (718) 757-7033\n\nThank you,\nLumina Therapy Alliance Care Team`,
    }
  }

  const genText = (c, type, token) => {
    const link = `${ASSESS_BASE_URL}/assess/${token}`
    return `Lumina Therapy Alliance: Hi ${c.clientName?.split(' ')[0] || 'there'}, your ${type === 'PHQ9' ? 'depression (PHQ-9)' : 'anxiety (GAD-7)'} check-in is ready. Takes 2 min: ${link}  Questions? Call (718) 757-7033.`
  }

  // In-person form view
  if (activeForm) {
    const client = db.clients.find(c => c.id === activeForm.clientId)
    const card   = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }
    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <button onClick={() => setActiveForm(null)}
            style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:4, padding:'6px 12px', fontSize:12, color:C.textMid, cursor:'pointer', fontFamily:'Arial,sans-serif' }}>
            ← Back
          </button>
          <div style={{ fontSize:13, color:C.textMid }}>In-person assessment — <strong style={{ color:C.textDark }}>{client?.clientName || client?.anonId}</strong></div>
        </div>
        <div style={{ ...card, padding:18 }}>
          <AssessmentForm type={activeForm.type} clientName={client?.clientName || ''} onSubmit={handleFormSubmit} onCancel={() => setActiveForm(null)}/>
        </div>
      </div>
    )
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Send Assessments" sub="PHQ-9 & GAD-7 · remote link or in-person"/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        <div style={{ background:`${C.teal}0d`, border:`1px solid ${C.teal}35`, borderRadius:5, padding:'12px 14px', fontSize:12, color:C.tealDark, lineHeight:1.7 }}>
          <strong>💻 Remote clients:</strong> Click <strong>Send Link</strong> — generates a unique personal link and ready-to-copy email or text. Client completes it on their own device. Score saves automatically when they submit.
        </div>
        <div style={{ background:`${C.tealGreen}0d`, border:`1px solid ${C.tealGreen}35`, borderRadius:5, padding:'12px 14px', fontSize:12, color:C.tealDark, lineHeight:1.7 }}>
          <strong>🏢 In-person clients:</strong> Click <strong>Start Now</strong> to open the form right here. Hand device to client or complete together. Score saves immediately on submit.
        </div>
      </div>

      <div style={{ ...card, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {['Client', 'Practice / Modality', 'PHQ-9', 'GAD-7', 'Actions'].map((h, i) => (
                <th key={i} style={{ ...TH, textAlign:'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleClients.map((c, i) => {
              const prac  = db.practices.find(p => p.id === c.practiceId)
              const phqSt = getStatus(c.id, 'PHQ9')
              const gadSt = getStatus(c.id, 'GAD7')
              return (
                <tr key={c.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white }}>
                  <td style={TD(false)}>
                    <div style={{ fontWeight:600, color:C.textDark }}>{c.clientName || <span style={{ color:C.border }}>—</span>}</div>
                    <div style={{ fontSize:10, fontFamily:'monospace', color:C.teal, marginTop:2 }}>{c.anonId}</div>
                  </td>
                  <td style={{ ...TD(false), fontSize:12 }}>
                    <div>{prac?.name}</div>
                    <ModalityBadge modality={c.modality}/>
                  </td>
                  <td style={TD(false)}>
                    <div style={{ fontSize:11, fontWeight:600, color:phqSt.color }}>{phqSt.label}</div>
                  </td>
                  <td style={TD(false)}>
                    <div style={{ fontSize:11, fontWeight:600, color:gadSt.color }}>{gadSt.label}</div>
                  </td>
                  <td style={TD(false)}>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      <Btn
                        variant="primary"
                        small
                        disabled={starting}
                        onClick={async () => {
                          setStarting(true)
                          try {
                            const token = await createToken(c.id, 'PHQ9')
                            setMsgModal({ client: c, type: 'PHQ9', token })
                            setTab('email')
                          } finally {
                            setStarting(false)
                          }
                        }}
                      >
                        📧 PHQ-9 Link
                      </Btn>
                      <Btn
                        variant="primary"
                        small
                        disabled={starting}
                        onClick={async () => {
                          setStarting(true)
                          try {
                            const token = await createToken(c.id, 'GAD7')
                            setMsgModal({ client: c, type: 'GAD7', token })
                            setTab('email')
                          } finally {
                            setStarting(false)
                          }
                        }}
                      >
                        📧 GAD-7 Link
                      </Btn>
                      {c.modality === 'in-person' && (
                        <>
                          <Btn
                            variant="ghost"
                            small
                            disabled={starting}
                            onClick={async () => {
                              setStarting(true)
                              try {
                                const token = await createToken(c.id, 'PHQ9')
                                setActiveForm({ clientId: c.id, type: 'PHQ9', token })
                              } finally {
                                setStarting(false)
                              }
                            }}
                          >
                            Start PHQ-9
                          </Btn>
                          <Btn
                            variant="ghost"
                            small
                            disabled={starting}
                            onClick={async () => {
                              setStarting(true)
                              try {
                                const token = await createToken(c.id, 'GAD7')
                                setActiveForm({ clientId: c.id, type: 'GAD7', token })
                              } finally {
                                setStarting(false)
                              }
                            }}
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

      {msgModal && (() => {
        const { client: c, type, token } = msgModal
        const email = genEmail(c, type, token)
        const text  = genText(c, type, token)
        const link  = `${ASSESS_BASE_URL}/assess/${token}`
        const msg   = tab === 'email' ? `Subject: ${email.subject}\n\n${email.body}` : text
        return (
          <Modal title={`Send ${type === 'PHQ9' ? 'PHQ-9' : 'GAD-7'} Link — ${c.clientName || c.anonId}`} onClose={() => setMsgModal(null)}>
            <div style={{ background:`${C.teal}0d`, border:`1px solid ${C.teal}35`, borderRadius:4, padding:'9px 12px', fontSize:12, color:C.tealDark, marginBottom:14, lineHeight:1.6 }}>
              A unique assessment link has been generated. Copy the message below and send from your email or phone. The assessment will appear as <strong>pending</strong> until the client submits it.
            </div>
            <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:4, padding:'9px 12px', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
              <span style={{ fontSize:11, fontFamily:'monospace', color:C.textDark, wordBreak:'break-all' }}>{link}</span>
              <button onClick={() => navigator.clipboard?.writeText(link)}
                style={{ flexShrink:0, background:'none', border:`1px solid ${C.border}`, borderRadius:3, padding:'3px 8px', fontSize:11, color:C.teal, cursor:'pointer', fontFamily:'Arial,sans-serif' }}>
                Copy Link
              </button>
            </div>
            <div style={{ display:'flex', gap:0, marginBottom:12, border:`1px solid ${C.border}`, borderRadius:4, overflow:'hidden' }}>
              {[['email', '📧 Email'], ['text', '💬 Text']].map(([v, l]) => (
                <button key={v} onClick={() => setTab(v)}
                  style={{ flex:1, padding:'8px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Arial,sans-serif', background:tab === v ? C.teal : C.white, color:tab === v ? C.white : C.textMid, border:'none', borderRight:v === 'email' ? `1px solid ${C.border}` : 'none' }}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:12, fontSize:12, color:C.textDark, whiteSpace:'pre-wrap', lineHeight:1.7, maxHeight:240, overflowY:'auto', fontFamily:tab === 'text' ? 'Arial,sans-serif' : 'monospace', marginBottom:12 }}>{msg}</div>
            <div style={{ fontSize:11, color:C.textMid, marginBottom:14 }}>
              {tab === 'email' ? `To: ${c.email || '⚠ no email on file'}` : `To: ${c.phone || '⚠ no phone on file'}`}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn onClick={() => { navigator.clipboard?.writeText(msg); setMsgModal(null) }}>
                Copy {tab === 'email' ? 'Email' : 'Text'} &amp; Close
              </Btn>
              <Btn variant="secondary" onClick={() => setMsgModal(null)}>Cancel</Btn>
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
