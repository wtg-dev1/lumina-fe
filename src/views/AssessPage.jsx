/**
 * AssessPage — Public client-facing assessment form
 * Accessed via /assess/:token (from emailed/texted link)
 * No authentication required.
 *
 * In production:
 *   1. On mount: GET /api/v1/assessments/token/:token to get clientName + type
 *   2. On submit: POST /api/v1/assessments/token/:token with { answers, score, completedAt }
 */

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { C, PHQ9_QUESTIONS, GAD7_QUESTIONS } from '../utils/constants'
import { phqSev, gadSev } from '../utils/helpers'
import AssessmentForm from '../components/AssessmentForm'
import { useStore } from '../data/store'

export default function AssessPage() {
  const { token }           = useParams()
  const [searchParams]      = useSearchParams()
  const { state, dispatch } = useStore()

  const urlType = searchParams.get('type') || ''
  const urlName = searchParams.get('name') || ''

  const [screen,      setScreen]      = useState('select') // select | form | done
  const [instrument,  setInstrument]  = useState(urlType || null)
  const [clientName,  setClientName]  = useState(urlName)
  const [clientId,    setClientId]    = useState(null)
  const [score,       setScore]       = useState(null)
  const [loading,     setLoading]     = useState(!!token)
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (!token) { setLoading(false); return }

    // TODO: Replace with real API call:
    // const data = await api.assessments.getByToken(token)
    // setClientName(data.clientName)
    // setInstrument(data.type)
    // setClientId(data.clientId)
    // setScreen('form')

    // Demo: resolve token from local store
    const pending = state.assessments.find(a => a.token === token)
    if (pending) {
      const client = state.clients.find(c => c.id === pending.clientId)
      setClientName(client?.clientName || '')
      setInstrument(pending.type)
      setClientId(pending.clientId)
      setScreen('form')
    } else {
      setError('This assessment link is invalid or has already been completed.')
    }
    setLoading(false)
  }, [token])

  // Auto-start if type is in URL
  useEffect(() => {
    if (urlType && !token) {
      setInstrument(urlType)
      setScreen('form')
    }
  }, [urlType])

  const handleSubmit = (answers, totalScore) => {
    setScore(totalScore)

    // TODO: Replace with real API call:
    // await api.assessments.submitByToken(token, { answers, score: totalScore, completedAt: new Date().toISOString() })

    // Demo: update local store
    if (clientId) {
      dispatch({ type:'COMPLETE_ASSESSMENT', payload:{ clientId, type:instrument, score:totalScore, answers } })
    }
    setScreen('done')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bgPage, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ color:C.teal, fontSize:14 }}>Loading your assessment…</span>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bgPage, fontFamily:'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background:C.tealDark, padding:'16px 20px', textAlign:'center' }}>
        <div style={{ fontSize:10, color:'#A8D5D5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Lumina Therapy Alliance</div>
        <div style={{ fontSize:16, fontWeight:700, color:C.white }}>
          {screen==='select' ? 'Mental Health Check-In' : instrument==='PHQ9' ? 'PHQ-9 — Depression Screening' : 'GAD-7 — Anxiety Screening'}
        </div>
        {clientName && <div style={{ fontSize:12, color:'#A8D5D5', marginTop:3 }}>Hello, {clientName.split(' ')[0]}</div>}
      </div>

      <div style={{ maxWidth:600, margin:'0 auto', padding:'20px 16px 40px' }}>

        {error && (
          <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:5, padding:'14px 16px', color:'#B03A3A', textAlign:'center', marginTop:20 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>⚠</div>
            <div style={{ fontWeight:700, marginBottom:4 }}>Link Not Found</div>
            <div style={{ fontSize:13 }}>{error}</div>
            <div style={{ fontSize:12, color:'#B03A3A', marginTop:12 }}>
              Questions? Contact us at drselling@luminatherapyalliance.com or (718) 757-7033
            </div>
          </div>
        )}

        {/* Selector screen */}
        {screen==='select' && !error && (
          <div style={{ paddingTop:24 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.textDark, marginBottom:6 }}>
              Which assessment would you like to complete?
            </div>
            <div style={{ fontSize:13, color:C.textMid, marginBottom:20, lineHeight:1.6 }}>
              Both take about 2 minutes. Your responses are confidential.
            </div>
            {[
              { id:'PHQ9', name:'PHQ-9', full:'Patient Health Questionnaire', topic:'Depression Screening', n:9, max:27 },
              { id:'GAD7', name:'GAD-7', full:'Generalized Anxiety Disorder Scale', topic:'Anxiety Screening', n:7, max:21 },
            ].map(instr => (
              <div key={instr.id} onClick={() => { setInstrument(instr.id); setScreen('form') }}
                style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:18, marginBottom:12, cursor:'pointer', transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=C.teal}
                onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
                <div style={{ fontWeight:700, fontSize:14, color:C.textDark, marginBottom:4 }}>{instr.name} — {instr.topic}</div>
                <div style={{ fontSize:12, color:C.textMid }}>{instr.full}</div>
                <div style={{ fontSize:11, color:C.teal, marginTop:8, fontWeight:600 }}>{instr.n} questions · scored out of {instr.max}</div>
              </div>
            ))}
            <div style={{ fontSize:11, color:C.textMid, marginTop:16, lineHeight:1.6, fontStyle:'italic' }}>
              This questionnaire is for clinical monitoring purposes only and is not a diagnosis. Your responses are confidential and will only be shared with your clinician and care coordinator.
            </div>
          </div>
        )}

        {/* Form */}
        {screen==='form' && instrument && (
          <div style={{ marginTop:16, background:C.white, border:`1px solid ${C.border}`, borderRadius:6, padding:18 }}>
            <AssessmentForm
              type={instrument}
              clientName={clientName}
              onSubmit={handleSubmit}
              onCancel={!token ? () => setScreen('select') : null}
            />
          </div>
        )}

        {/* Done */}
        {screen==='done' && (
          <div style={{ textAlign:'center', paddingTop:40 }}>
            <div style={{ fontSize:52, marginBottom:16 }}>✓</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.tealDark, marginBottom:8 }}>
              Thank you{clientName ? `, ${clientName.split(' ')[0]}` : ''}!
            </div>
            <div style={{ fontSize:14, color:C.textMid, marginBottom:28, lineHeight:1.7 }}>
              Your responses have been recorded and shared securely with your care team.<br/>
              There's nothing else you need to do.
            </div>
            {instrument==='PHQ9' && score >= 10 && (
              <div style={{ background:'#FFF3E0', border:'1px solid #F0A500', borderRadius:5, padding:'14px 16px', color:'#8B5E00', fontSize:13, textAlign:'left', lineHeight:1.7, marginBottom:20 }}>
                <strong>Important:</strong> If you are having thoughts of hurting yourself or ending your life, please reach out for support immediately.<br/><br/>
                📞 <strong>988 Suicide & Crisis Lifeline:</strong> Call or text <strong>988</strong> (free, 24/7)<br/>
                📞 <strong>Crisis Text Line:</strong> Text HOME to <strong>741741</strong>
              </div>
            )}
            <div style={{ fontSize:11, color:C.textMid, marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              Questions? Contact your Lumina care coordinator:<br/>
              <strong>drselling@luminatherapyalliance.com</strong> · <strong>(718) 757-7033</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
