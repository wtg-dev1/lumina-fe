import { C } from '../../utils/constants'

// Table header cell style object — apply with style={TH}
export const TH = {
  padding:'9px 14px', fontSize:10, fontWeight:700, color:C.textMid,
  textTransform:'uppercase', letterSpacing:'0.06em',
  borderBottom:`1px solid ${C.border}`, background:C.cream, whiteSpace:'nowrap',
}

// Table data cell style factory — TD() left-aligned, TD(true) right-aligned
export const TD = (right = false) => ({
  padding:'10px 14px', textAlign:right?'right':'left',
  color:C.textDark, borderBottom:`1px solid ${C.border}`, verticalAlign:'middle',
})

// Masked account number display helper
export const maskAccount = (s) => s ? '••••' + String(s).slice(-4) : '—'
