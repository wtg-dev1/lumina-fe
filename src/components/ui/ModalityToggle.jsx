import React from 'react'
import { C } from '../../utils/constants'

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
