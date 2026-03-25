import React from 'react'
import { C } from '../../utils/constants'

export const Bar = ({ v, max, color = C.teal }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <div style={{ flex:1, background:C.cream, borderRadius:2, height:5, border:`1px solid ${C.border}` }}>
      <div style={{ width:`${Math.min(100,(v/max)*100)}%`, height:'100%', background:color, borderRadius:2 }} />
    </div>
    <span style={{ fontSize:11, fontFamily:'monospace', color:C.textMid, minWidth:20, textAlign:'right' }}>{v}</span>
  </div>
)
