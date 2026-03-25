import React from 'react'
import { C } from '../../utils/constants'

export const Inp = ({ label, hint, ...props }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{label}</label>
    <input style={{ width:'100%', boxSizing:'border-box', border:`1px solid ${C.border}`, borderRadius:4, padding:'8px 10px', fontSize:13, color:C.textDark, fontFamily:'Arial,sans-serif', outline:'none' }} {...props}/>
    {hint && <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>{hint}</div>}
  </div>
)
