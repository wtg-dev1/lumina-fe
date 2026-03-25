import React from 'react'
import { C } from '../../utils/constants'

export const Sel = ({ label, options, hint, ...props }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{label}</label>
    <select style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', background:C.white, outline:'none' }} {...props}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {hint && <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>{hint}</div>}
  </div>
)
