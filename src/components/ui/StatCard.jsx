import React from 'react'
import { C } from '../../utils/constants'

export const StatCard = ({ label, value, sub, accent = C.teal }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:'16px 18px', borderTop:`3px solid ${accent}` }}>
    <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:700, color:C.textDark, fontFamily:'monospace' }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.textMid, marginTop:3 }}>{sub}</div>}
  </div>
)
