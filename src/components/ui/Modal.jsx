import React from 'react'
import { C } from '../../utils/constants'

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
