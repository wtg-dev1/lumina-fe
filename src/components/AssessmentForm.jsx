/**
 * AssessmentForm — Client-facing PHQ-9 / GAD-7 form
 * Used both in-app (in-person) and as a standalone page (remote via link)
 */

import React, { useState } from 'react'
import { C, PHQ9_QUESTIONS, GAD7_QUESTIONS, FREQ_OPTIONS } from '../utils/constants'
import { phqSev, gadSev } from '../utils/helpers'
import { Btn } from './ui'

export default function AssessmentForm({ type, clientName, onSubmit, onCancel }) {
  const questions = type === 'PHQ9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS
  const [answers, setAnswers]   = useState(Array(questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = answers.every(a => a !== null)
  const totalScore  = answers.reduce((s, a) => s + (a || 0), 0)
  const maxScore    = type === 'PHQ9' ? 27 : 21
  const sev         = (type === 'PHQ9' ? phqSev : gadSev)(totalScore)

  const title = type === 'PHQ9' ? 'PHQ-9 — Depression Screening' : 'GAD-7 — Anxiety Screening'
  const intro = type === 'PHQ9'
    ? 'Over the last 2 weeks, how often have you been bothered by any of the following problems?'
    : 'Over the last 2 weeks, how often have you been bothered by the following problems?'

  const handleSubmit = () => {
    setSubmitted(true)
    onSubmit(answers, totalScore)
  }

  const selectAnswer = (qi, val) => {
    const next = [...answers]
    next[qi] = val
    setAnswers(next)
  }

  if (submitted) {
    return (
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
        <div style={{ fontSize:20, fontWeight:700, color:C.tealDark, marginBottom:8 }}>
          Thank you{clientName ? `, ${clientName.split(' ')[0]}` : ''}!
        </div>
        <div style={{ fontSize:14, color:C.textMid, marginBottom:24, lineHeight:1.6 }}>
          Your responses have been recorded and shared with your care team.
        </div>
        <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:8, padding:'20px 28px', display:'inline-block', minWidth:180 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{type} Score</div>
          <div style={{ fontSize:40, fontWeight:700, color:sev.c, fontFamily:'monospace' }}>{totalScore}</div>
          <div style={{ fontSize:13, color:sev.c, fontWeight:600, marginTop:4 }}>{sev.l}</div>
          <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>out of {maxScore}</div>
        </div>
        {type === 'PHQ9' && totalScore >= 10 && (
          <div style={{ background:'#FFF3E0', border:'1px solid #F0A500', borderRadius:5, padding:'12px 16px', color:'#8B5E00', marginTop:20, fontSize:13, textAlign:'left', lineHeight:1.7 }}>
            If you are having thoughts of harming yourself, please reach out for support immediately.<br/>
            📞 <strong>988 Suicide & Crisis Lifeline:</strong> Call or text <strong>988</strong> (free, 24/7)
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background:C.tealDark, padding:'18px 22px', borderRadius:'5px 5px 0 0', margin:'-18px -18px 18px' }}>
        <div style={{ fontSize:10, color:'#A8D5D5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Lumina Therapy Alliance</div>
        <div style={{ fontSize:16, fontWeight:700, color:C.white }}>{title}</div>
        {clientName && <div style={{ fontSize:12, color:'#A8D5D5', marginTop:3 }}>For: {clientName}</div>}
      </div>

      {/* Progress */}
      <div style={{ marginBottom:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.textMid, marginBottom:5 }}>
          <span>{answers.filter(a=>a!==null).length} of {questions.length} answered</span>
          {allAnswered && <span style={{ color:C.tealGreen, fontWeight:700 }}>✓ Ready to submit</span>}
        </div>
        <div style={{ background:C.cream, borderRadius:2, height:5, border:`1px solid ${C.border}` }}>
          <div style={{ width:`${(answers.filter(a=>a!==null).length/questions.length)*100}%`, height:'100%', background:C.teal, borderRadius:2, transition:'width 0.3s' }}/>
        </div>
      </div>

      {/* Intro */}
      <div style={{ fontSize:13, color:C.textDark, marginBottom:18, lineHeight:1.7, background:C.cream, border:`1px solid ${C.border}`, borderRadius:4, padding:'12px 14px' }}>
        {intro}
      </div>

      {/* Questions */}
      <div style={{ display:'grid', gap:12 }}>
        {questions.map((q, qi) => (
          <div key={qi} id={`q${qi}`}
            style={{ background:answers[qi]!==null ? `${C.teal}08` : C.white, border:`1px solid ${answers[qi]!==null?C.teal:C.border}`, borderRadius:5, padding:'14px 16px', transition:'all 0.2s' }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.textDark, marginBottom:12, lineHeight:1.5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.teal, marginRight:8 }}>{qi+1}.</span>{q}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {FREQ_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => selectAnswer(qi, opt.value)}
                  style={{ padding:'9px 12px', borderRadius:4, fontSize:12, fontWeight:answers[qi]===opt.value?700:400, cursor:'pointer', fontFamily:'Arial,sans-serif', textAlign:'left',
                    background: answers[qi]===opt.value ? C.teal : C.white,
                    color:      answers[qi]===opt.value ? C.white : C.textDark,
                    border:     `1px solid ${answers[qi]===opt.value ? C.teal : C.border}`,
                  }}>
                  <span style={{ fontSize:10, marginRight:6, opacity:0.7 }}>{opt.value}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score preview */}
      {allAnswered && (
        <div style={{ marginTop:18, background:C.cream, border:`1px solid ${C.border}`, borderRadius:5, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11, color:C.textMid, marginBottom:2 }}>Your {type} score</div>
            <div style={{ fontSize:28, fontWeight:700, color:sev.c, fontFamily:'monospace' }}>
              {totalScore} <span style={{ fontSize:14, color:sev.c }}>{sev.l}</span>
            </div>
          </div>
          <div style={{ textAlign:'right', fontSize:11, color:C.textMid }}>out of {maxScore}</div>
        </div>
      )}

      <div style={{ fontSize:11, color:C.textMid, marginTop:14, marginBottom:16, lineHeight:1.6, fontStyle:'italic' }}>
        This questionnaire is for clinical monitoring purposes only and is not a diagnosis. Your responses are confidential and shared only with your clinician and care coordinator.
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <Btn onClick={handleSubmit} disabled={!allAnswered}>
          Submit {type==='PHQ9'?'PHQ-9':'GAD-7'}
        </Btn>
        {onCancel && <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>}
      </div>
    </div>
  )
}
