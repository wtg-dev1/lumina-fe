import React from 'react'
import { BADGE_STYLES } from '../../utils/helpers'

export const Badge = ({ status }) => {
  const s = BADGE_STYLES[status] || BADGE_STYLES.draft
  const label = String(status || '').replace(/_/g, ' ')
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, textTransform:'capitalize', whiteSpace:'nowrap' }}>
      {label}
    </span>
  )
}
