/**
 * Lumina Ops — Shared UI Components
 * All brand colors from Lumina_HL_Proposal_Document.docx
 */

import React, { useState } from 'react'
import { C } from '../utils/constants'
import { BADGE_STYLES, PSYPACT_STATES } from '../utils/helpers'

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ status }) => {
  const s = BADGE_STYLES[status] || BADGE_STYLES.draft
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, textTransform:'capitalize', whiteSpace:'nowrap' }}>
      {status}
    </span>
  )
}

// ── Modality Badge ─────────────────────────────────────────────────────────────
export const ModalityBadge = ({ modality }) => {
  if (!modality) return null
  const ip = modality === 'in-person'
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, whiteSpace:'nowrap',
      background: ip ? '#E6F4F1' : '#EEF2FF',
      color:      ip ? '#1D6B6B' : '#3730A3',
      border:     `1px solid ${ip ? '#2A7F7F' : '#818CF8'}`,
    }}>
      {ip ? '🏢 In-Person' : '💻 Virtual'}
    </span>
  )
}

// ── PSYPACT Badge ─────────────────────────────────────────────────────────────
export const PsypactBadge = ({ state: clientState }) => {
  if (!clientState) return null
  const ok = PSYPACT_STATES.has(clientState)
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
      background: ok ? '#E6F4F1' : '#FFF3E0',
      color:      ok ? C.tealDark : '#8B5E00',
      border:     `1px solid ${ok ? C.teal : '#F0A500'}`,
    }}>
      {ok ? 'PSYPACT ✓' : 'Non-PSYPACT ⚠'}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, disabled, variant = 'primary', small, style = {} }) => {
  const variants = {
    primary:   { background:C.teal,        color:C.white, border:`1px solid ${C.tealDark}` },
    secondary: { background:C.white,       color:C.teal,  border:`1px solid ${C.teal}` },
    ghost:     { background:'transparent', color:C.teal,  border:`1px solid ${C.tealMid}` },
    danger:    { background:'#C0392B',     color:C.white, border:'1px solid #A93226' },
  }
  const v = variants[variant] || variants.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...v, fontSize:small?11:13, fontWeight:600, padding:small?'4px 10px':'8px 16px', borderRadius:4, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.4:1, fontFamily:'Arial,sans-serif', whiteSpace:'nowrap', ...style }}>
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export const Inp = ({ label, hint, ...props }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{label}</label>
    <input style={{ width:'100%', boxSizing:'border-box', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', outline:'none' }} {...props}/>
    {hint && <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>{hint}</div>}
  </div>
)

// ── Select ────────────────────────────────────────────────────────────────────
export const Sel = ({ label, options, hint, ...props }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{label}</label>
    <select style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', background:C.white, outline:'none' }} {...props}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {hint && <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>{hint}</div>}
  </div>
)

// ── Modality Toggle ───────────────────────────────────────────────────────────
export const ModalityToggle = ({ value, onChange, label = 'Modality' }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>{label}</label>
    <div style={{ display:'flex', gap:0, border:`1px solid ${C.border}`, borderRadius:4, overflow:'hidden' }}>
      {[['in-person','🏢 In-Person'],['virtual','💻 Virtual']].map(([v,l]) => (
        <button key={v} type="button" onClick={() => onChange(v)} style={{
          flex:1, padding:'9px 0', fontSize:13, fontWeight:700, cursor:'pointer',
          fontFamily:'Arial,sans-serif', border:'none',
          background: value===v ? C.teal : C.white,
          color:      value===v ? C.white : C.textMid,
          borderRight: v==='in-person' ? `1px solid ${C.border}` : 'none',
        }}>{l}</button>
      ))}
    </div>
  </div>
)

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, maxWidth = 480 }) => (
  <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'rgba(29,107,107,0.25)', backdropFilter:'blur(3px)' }}
    onClick={e => { if (e.target===e.currentTarget) onClose() }}>
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, width:'100%', maxWidth, maxHeight:'88vh', overflowY:'auto', boxShadow:'0 12px 48px rgba(29,107,107,0.2)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:`1px solid ${C.border}`, background:C.cream }}>
        <span style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{title}</span>
        <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, color:C.textMid, cursor:'pointer', lineHeight:1 }}>×</button>
      </div>
      <div style={{ padding:18 }}>{children}</div>
    </div>
  </div>
)

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, accent = C.teal }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:'16px 18px', borderTop:`3px solid ${accent}` }}>
    <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:700, color:C.textDark, fontFamily:'monospace' }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.textMid, marginTop:3 }}>{sub}</div>}
  </div>
)

// ── Section Header ────────────────────────────────────────────────────────────
export const SH = ({ title, sub, action }) => (
  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.textDark, margin:0 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:C.textMid, margin:'3px 0 0' }}>{sub}</p>}
    </div>
    {action}
  </div>
)

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, ...style }}>
    {children}
  </div>
)

// ── Table ─────────────────────────────────────────────────────────────────────
export const TH = { padding:'9px 14px', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:`1px solid ${C.border}`, background:C.cream, whiteSpace:'nowrap' }
export const TD = (right = false) => ({ padding:'10px 14px', textAlign:right?'right':'left', color:C.textDark, borderBottom:`1px solid ${C.border}`, verticalAlign:'middle' })

// ── Progress Bar ──────────────────────────────────────────────────────────────
export const Bar = ({ v, max, color = C.teal }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <div style={{ flex:1, background:C.cream, borderRadius:2, height:5, border:`1px solid ${C.border}` }}>
      <div style={{ width:`${Math.min(100,(v/max)*100)}%`, height:'100%', background:color, borderRadius:2 }} />
    </div>
    <span style={{ fontSize:11, fontFamily:'monospace', color:C.textMid, minWidth:20, textAlign:'right' }}>{v}</span>
  </div>
)

// ── Info Note ─────────────────────────────────────────────────────────────────
export const Note = ({ children, color = C.teal }) => (
  <div style={{ background:`${color}0f`, border:`1px solid ${color}35`, borderRadius:4, padding:'8px 12px', fontSize:12, color, marginBottom:14, lineHeight:1.6 }}>
    {children}
  </div>
)

// ── Masked account number ─────────────────────────────────────────────────────
export const maskAccount = (s) => s ? '••••' + String(s).slice(-4) : '—'
