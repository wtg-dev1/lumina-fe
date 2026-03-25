import React from 'react'
import { C } from '../../utils/constants'

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
