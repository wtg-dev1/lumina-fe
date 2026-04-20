import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const UiShellStoreContext = createContext(null)

export const SESSION_LOCK = {
  MULTI: 'multi',
  PRACTICE: 'practice',
  EMPLOYER: 'employer',
}

const STORAGE_ROLE = 'lumina_role'
const STORAGE_LOCK = 'lumina_session_lock'

const VALID_LOCKS = new Set(Object.values(SESSION_LOCK))

function readValidSessionLock() {
  const v = localStorage.getItem(STORAGE_LOCK)
  return VALID_LOCKS.has(v) ? v : null
}

export function UiShellStoreProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_ROLE) || 'admin')
  const [sessionLock, setSessionLock] = useState(readValidSessionLock)
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const onLogout = () => {
      setRole(localStorage.getItem(STORAGE_ROLE) || 'admin')
      setSessionLock(readValidSessionLock())
    }
    window.addEventListener('lumina:logout', onLogout)
    return () => window.removeEventListener('lumina:logout', onLogout)
  }, [])

  const applyPostLogin = useCallback(({ role: nextRole, sessionLock: nextLock }) => {
    localStorage.setItem(STORAGE_ROLE, nextRole)
    localStorage.setItem(STORAGE_LOCK, nextLock)
    setRole(nextRole)
    setSessionLock(nextLock)
  }, [])

  const switchRole = useCallback((nextRole) => {
    setRole(nextRole)
    localStorage.setItem(STORAGE_ROLE, nextRole)
  }, [])

  const value = useMemo(() => ({
    role,
    sessionLock,
    navOpen,
    setNavOpen,
    switchRole,
    applyPostLogin,
  }), [role, sessionLock, navOpen, applyPostLogin, switchRole])

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
