import React from 'react'
import { C } from '../../utils/constants'

// SectionHeader — title row with optional subtitle and action button
export const SH = ({ title, sub, action }) => (
  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.textDark, margin:0 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:C.textMid, margin:'3px 0 0' }}>{sub}</p>}
    </div>
    {action}
  </div>
)
