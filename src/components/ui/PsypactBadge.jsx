import React from 'react'
import { C } from '../../utils/constants'
import { PSYPACT_STATES } from '../../utils/helpers'

export const PsypactBadge = ({ state: clientState }) => {
  if (!clientState) return null
  const ok = PSYPACT_STATES.has(clientState)
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:3,
      background: ok ? '#E6F4F1' : '#FFF3E0',
      color:      ok ? C.tealDark : '#8B5E00',
      border:     `1px solid ${ok ? C.teal : '#F0A500'}`,
    }}>
      {ok ? 'PSYPACT ✓' : 'Non-PSYPACT ⚠'}
    </span>
  )
}
