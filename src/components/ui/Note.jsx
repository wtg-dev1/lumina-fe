import React from 'react'
import { C } from '../../utils/constants'

export const Note = ({ children, color = C.teal }) => (
  <div style={{ background:`${color}0f`, border:`1px solid ${color}35`, borderRadius:4, padding:'8px 12px', fontSize:12, color, marginBottom:14, lineHeight:1.6 }}>
    {children}
  </div>
)
