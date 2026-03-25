import React from 'react'

export const ModalityBadge = ({ modality }) => {
  if (!modality) return null
  const ip = modality === 'in-person'
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:3, whiteSpace:'nowrap',
      background: ip ? '#E6F4F1' : '#EEF2FF',
      color:      ip ? '#1D6B6B' : '#3730A3',
      border:     `1px solid ${ip ? '#2A7F7F' : '#818CF8'}`,
    }}>
      {ip ? '🏢 In-Person' : '💻 Virtual'}
    </span>
  )
}
