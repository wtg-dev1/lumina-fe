import React, { createContext, useContext, useMemo, useState } from 'react'

const UiShellStoreContext = createContext(null)

export function UiShellStoreProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('lumina_role') || 'admin')
  const [navOpen, setNavOpen] = useState(false)

  const switchRole = (nextRole) => {
    setRole(nextRole)
    localStorage.setItem('lumina_role', nextRole)
  }

  const value = useMemo(() => ({
    role,
    navOpen,
    setNavOpen,
    switchRole,
  }), [role, navOpen])

  return (
    <UiShellStoreContext.Provider value={value}>
      {children}
    </UiShellStoreContext.Provider>
  )
}

export function useUiShellStore() {
  const ctx = useContext(UiShellStoreContext)
  if (!ctx) throw new Error('useUiShellStore must be used within UiShellStoreProvider')
  return ctx
}
