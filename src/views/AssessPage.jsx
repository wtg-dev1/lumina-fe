/**
 * AssessPage — Public client-facing assessment form
 *
 * Accessed via /assessments/:token (from an emailed link). No authentication required.
 *
 *   1. On mount:   GET  /api/v1/public/assessments/:token
 *   2. On submit:  POST /api/v1/public/assessments/:token/submit   { answers }
 *
 *   - 404 → "Link not found" page
 *   - 410 → "Link expired or already used" page
 *   - success → thank-you screen with backend-returned score + severity, and
 *     crisis resources when `show_crisis_resources=true`.
 */

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { C, CRISIS_RESOURCES } from '../utils/constants'
import AssessmentForm from '../components/AssessmentForm'
import { usePublicAssessmentStore } from '../data/stores'
import { mapApiError, trackAssessmentEvent } from '../utils/helpers'

const SUPPORT_EMAIL = 'drselling@luminatherapyalliance.com'
const SUPPORT_PHONE = '(718) 757-7033'

function ShellLayout({ title, clientName, children }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bgPage, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: C.tealDark, padding: '16px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#A8D5D5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
          Lumina Therapy Alliance
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>{title}</div>
        {clientName && <div style={{ fontSize: 12, color: '#A8D5D5', marginTop: 3 }}>Hello, {clientName.split(' ')[0]}</div>}
      </div>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 40px' }}>
        {children}
      </div>
    </div>
  )
}

function SupportFooter() {
  return (
    <div style={{ fontSize: 12, color: C.textMid, marginTop: 18, textAlign: 'center', lineHeight: 1.6 }}>
      Questions? Contact us at <strong>{SUPPORT_EMAIL}</strong> or <strong>{SUPPORT_PHONE}</strong>.
    </div>
  )
}

function InvalidLinkPage() {
  return (
    <ShellLayout title="Link not found">
      <div style={{ background: '#FCE8E8', border: '1px solid #D9534F', borderRadius: 5, padding: '20px 20px', color: '#B03A3A', textAlign: 'center', marginTop: 20 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚠</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>We couldn't find this assessment link</div>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          The link may be mistyped. Please double-check it, or contact your care coordinator to request a new one.
        </div>
      </div>
      <SupportFooter />
    </ShellLayout>
  )
}

function ExpiredLinkPage() {
  return (
    <ShellLayout title="Link expired or already used">
      <div style={{ background: '#FFF3E0', border: '1px solid #F0A500', borderRadius: 5, padding: '20px 20px', color: '#8B5E00', textAlign: 'center', marginTop: 20 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>This link is no longer active</div>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          Assessment links are single-use and expire after a short time. Please contact your Lumina care coordinator to request a new one.
        </div>
        <div style={{ marginTop: 14 }}>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=New%20assessment%20link%20request`}
            style={{ display: 'inline-block', background: C.teal, color: C.white, padding: '8px 14px', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            Request a new link
          </a>
        </div>
      </div>
      <SupportFooter />
    </ShellLayout>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: C.bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: C.teal, fontSize: 14 }}>Loading your assessment…</span>
    </div>
  )
}

export default function AssessPage() {
  const publicAssessment = usePublicAssessmentStore()
  const { token } = useParams()
  const [searchParams] = useSearchParams()

  const urlType = (searchParams.get('type') || '').toUpperCase()
  const urlName = searchParams.get('name') || ''

  const [screen, setScreen] = useState(token ? 'loading' : 'select')
  const [instrument, setInstrument] = useState(urlType || null)
  const [clientName, setClientName] = useState(urlName)
  const [anonId, setAnonId] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const data = await publicAssessment.loadByToken(token)
        setClientName(data?.client?.client_name || data?.clientName || data?.client_name || '')
        setAnonId(data?.client?.anon_id || data?.anonId || '')
        const typeFromServer = (data?.assessment?.assessment_type || data?.assessment_type || data?.type || '').toUpperCase()
        setInstrument(typeFromServer || urlType || null)
        setScreen('form')
        trackAssessmentEvent('assessment_link_opened', {
          assessment_type: typeFromServer || urlType,
          anon_id: data?.client?.anon_id || data?.anonId || '',
        })
      } catch (err) {
        const mapped = mapApiError(err)
        if (mapped.kind === 'gone') setScreen('expired')
        else if (mapped.kind === 'not_found') setScreen('invalid')
        else setScreen('invalid')
      }
    })()
  }, [token])

  useEffect(() => {
    if (!token && urlType) {
      setInstrument(urlType)
      setScreen('form')
    }
  }, [urlType, token])

  const handleSubmit = async (answers) => {
    if (!token) {
      // No token: preview mode (dev) — just show the thank-you screen.
      setResult({
        score: answers.reduce((s, a) => s + (a || 0), 0),
        severity: '',
        show_crisis_resources: false,
      })
      setScreen('done')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    trackAssessmentEvent('assessment_submit_attempted', { assessment_type: instrument, anon_id: anonId })
    try {
      const res = await publicAssessment.submitByToken(token, { answers })
      setResult(res || {})
      setScreen('done')
      trackAssessmentEvent('assessment_submitted_success', { assessment_type: instrument, anon_id: anonId })
    } catch (err) {
      const mapped = mapApiError(err)
      trackAssessmentEvent('assessment_submit_failed', { assessment_type: instrument, anon_id: anonId, status: err?.status })
      if (mapped.kind === 'gone') {
        setScreen('expired')
      } else {
        setSubmitError(mapped.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnswered = ({ index, value }) => {
    trackAssessmentEvent('assessment_question_answered', {
      assessment_type: instrument,
      anon_id: anonId,
      question_index: index,
      value,
    })
  }

  if (screen === 'loading') return <LoadingScreen />
  if (screen === 'invalid') return <InvalidLinkPage />
  if (screen === 'expired') return <ExpiredLinkPage />

  const title = screen === 'select'
    ? 'Mental Health Check-In'
    : instrument === 'PHQ9'
    ? 'PHQ-9 — Depression Screening'
    : 'GAD-7 — Anxiety Screening'

  return (
    <ShellLayout title={title} clientName={clientName}>
      {/* Selector screen (dev only — no token) */}
      {screen === 'select' && (
        <div style={{ paddingTop: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.textDark, marginBottom: 6 }}>
            Which assessment would you like to complete?
          </div>
          <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20, lineHeight: 1.6 }}>
            Both take about 2 minutes. Your responses are confidential.
          </div>
          {[
            { id: 'PHQ9', name: 'PHQ-9', full: 'Patient Health Questionnaire',     topic: 'Depression Screening', n: 9, max: 27 },
            { id: 'GAD7', name: 'GAD-7', full: 'Generalized Anxiety Disorder Scale', topic: 'Anxiety Screening',    n: 7, max: 21 },
          ].map((instr) => (
            <div
              key={instr.id}
              onClick={() => { setInstrument(instr.id); setScreen('form') }}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18, marginBottom: 12, cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: C.textDark, marginBottom: 4 }}>{instr.name} — {instr.topic}</div>
              <div style={{ fontSize: 12, color: C.textMid }}>{instr.full}</div>
              <div style={{ fontSize: 11, color: C.teal, marginTop: 8, fontWeight: 600 }}>{instr.n} questions · scored out of {instr.max}</div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {screen === 'form' && instrument && (
        <div style={{ marginTop: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18 }}>
          {submitError && (
            <div style={{ background: '#FCE8E8', border: '1px solid #D9534F', color: '#B03A3A', borderRadius: 5, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
              {submitError}
            </div>
          )}
          <AssessmentForm
            type={instrument}
            clientName={clientName}
            submitting={submitting}
            skipInternalConfirmation
            onAnswer={handleAnswered}
            onSubmit={handleSubmit}
            onCancel={!token ? () => setScreen('select') : null}
          />
        </div>
      )}

      {/* Done */}
      {screen === 'done' && (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.tealDark, marginBottom: 8 }}>
            Thank you{clientName ? `, ${clientName.split(' ')[0]}` : ''}!
          </div>
          <div style={{ fontSize: 14, color: C.textMid, marginBottom: 22, lineHeight: 1.7 }}>
            Your responses have been recorded and shared securely with your care team.<br />
            There's nothing else you need to do.
          </div>
          {result?.score !== undefined && result?.score !== null && (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '16px 24px', display: 'inline-block', minWidth: 180, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Your Score</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: C.tealDark, fontFamily: 'monospace' }}>{result.score}</div>
              {result.severity && <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>{result.severity}</div>}
            </div>
          )}
          {result?.show_crisis_resources === true && (
            <div style={{ background: '#FFF3E0', border: '1px solid #F0A500', borderRadius: 5, padding: '14px 16px', color: '#8B5E00', fontSize: 13, textAlign: 'left', lineHeight: 1.7, marginTop: 4, marginBottom: 20 }}>
              <strong>Important:</strong> If you are having thoughts of hurting yourself or ending your life, please reach out for support immediately.<br /><br />
              📞 <strong>{CRISIS_RESOURCES.lifeline.name}:</strong> {CRISIS_RESOURCES.lifeline.contact} (free, 24/7)<br />
              📞 <strong>{CRISIS_RESOURCES.textLine.name}:</strong> {CRISIS_RESOURCES.textLine.contact}
            </div>
          )}
          <div style={{ fontSize: 11, color: C.textMid, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            Questions? Contact your Lumina care coordinator:<br />
            <strong>{SUPPORT_EMAIL}</strong> · <strong>{SUPPORT_PHONE}</strong>
          </div>
        </div>
      )}
    </ShellLayout>
  )
}
