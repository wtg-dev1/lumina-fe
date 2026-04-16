import React, { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { C, CRISIS_RESOURCES } from '../../utils/constants'
import { mapApiError, phqSev, gadSev, trackAssessmentEvent } from '../../utils/helpers'
import { useCareStore } from '../../data/stores'
import AssessmentForm from '../../components/AssessmentForm'
import { Btn } from '../../components/ui'

/**
 * InPersonAssessmentView — dedicated route for completing an in-person assessment
 *
 * Routes:
 *   /ops/admin/assessments/in-person/:id
 *   /ops/practice/assessments/in-person/:id
 *
 * Query params: ?type=PHQ9|GAD7&name=<clientName>&anon=<anonId>
 */
export default function InPersonAssessmentView({ practiceId = null }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const care = useCareStore()

  const type = (searchParams.get('type') || 'PHQ9').toUpperCase()
  const clientName = searchParams.get('name') || ''
  const anonId = searchParams.get('anon') || ''

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const backUrl = practiceId ? '/ops/practice/assessments' : '/ops/admin/send-assessments'

  const maxScore = type === 'PHQ9' ? 27 : 21
  const localSev = useMemo(() => {
    if (!result) return null
    const s = result.score ?? 0
    return type === 'PHQ9' ? phqSev(s) : gadSev(s)
  }, [result, type])

  const severityLabel = result?.severity || localSev?.l
  const severityColor = localSev?.c || C.textDark

  const handleSubmit = async (answers) => {
    if (!id) {
      setError('Missing assessment id.')
      return
    }
    setSubmitting(true)
    setError('')
    trackAssessmentEvent('assessment_submit_attempted', { assessment_type: type, anon_id: anonId })
    try {
      const res = await care.completeInPersonAssessment(id, answers)
      setResult(res || {})
      trackAssessmentEvent('assessment_submitted_success', { assessment_type: type, anon_id: anonId })
    } catch (err) {
      const mapped = mapApiError(err, {
        notFound: 'This assessment was not found. It may have already been completed.',
      })
      setError(mapped.message)
      trackAssessmentEvent('assessment_submit_failed', {
        assessment_type: type,
        anon_id: anonId,
        status: err?.status,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  if (result) {
    const showCrisis = result.show_crisis_resources === true
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Btn variant="secondary" small onClick={() => navigate(backUrl)}>← Back to Send Assessments</Btn>
          <div style={{ fontSize: 13, color: C.textMid }}>
            In-person assessment — <strong style={{ color: C.textDark }}>{clientName || anonId || 'Client'}</strong>
          </div>
        </div>
        <div style={{ ...card, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.tealDark, marginBottom: 6 }}>Response recorded</div>
          <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>
            {type === 'PHQ9' ? 'PHQ-9' : 'GAD-7'} completed for {clientName || anonId || 'this client'}.
          </div>
          <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 6, padding: '20px 28px', display: 'inline-block', minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Score</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: severityColor, fontFamily: 'monospace' }}>{result.score ?? '—'}</div>
            {severityLabel && <div style={{ fontSize: 13, color: severityColor, fontWeight: 600, marginTop: 4 }}>{severityLabel}</div>}
            <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>out of {maxScore}</div>
          </div>
          {showCrisis && (
            <div style={{ marginTop: 22, background: '#FFF3E0', border: '1px solid #F0A500', borderRadius: 5, padding: '14px 18px', color: '#8B5E00', fontSize: 13, textAlign: 'left', lineHeight: 1.7, maxWidth: 520, margin: '22px auto 0' }}>
              <strong>Crisis resources:</strong> review these with the client before they leave.
              <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                <li>📞 <strong>{CRISIS_RESOURCES.lifeline.name}:</strong> {CRISIS_RESOURCES.lifeline.contact} (free, 24/7)</li>
                <li>📞 <strong>{CRISIS_RESOURCES.textLine.name}:</strong> {CRISIS_RESOURCES.textLine.contact}</li>
              </ul>
            </div>
          )}
          <div style={{ marginTop: 22 }}>
            <Btn onClick={() => navigate(backUrl)}>Done</Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Btn variant="secondary" small onClick={() => navigate(backUrl)}>← Cancel</Btn>
        <div style={{ fontSize: 13, color: C.textMid }}>
          In-person {type === 'PHQ9' ? 'PHQ-9' : 'GAD-7'} —{' '}
          <strong style={{ color: C.textDark }}>{clientName || anonId || 'Client'}</strong>
        </div>
      </div>
      {error && (
        <div style={{ background: '#FCE8E8', border: '1px solid #D9534F', color: '#B03A3A', borderRadius: 5, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>{error}</div>
      )}
      <div style={{ ...card, padding: 18 }}>
        <AssessmentForm
          type={type}
          clientName={clientName}
          submitting={submitting}
          skipInternalConfirmation
          onSubmit={handleSubmit}
          onCancel={() => navigate(backUrl)}
        />
      </div>
    </div>
  )
}
