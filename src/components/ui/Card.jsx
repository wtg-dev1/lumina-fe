import React from 'react'
import { C } from '../../utils/constants'

export const Card = ({ children, style = {} }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, ...style }}>
    {children}
  </div>
)
