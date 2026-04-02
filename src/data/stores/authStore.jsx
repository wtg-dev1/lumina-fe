import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearToken, getToken } from '../../utils/api'

const AuthStoreContext = createContext(null)

export function AuthStoreProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken())

  useEffect(() => {
    const onTokenChange = () => setTokenState(getToken())
    window.addEventListener('lumina:token-changed', onTokenChange)
    return () => window.removeEventListener('lumina:token-changed', onTokenChange)
  }, [])

  const logout = () => {
    clearToken()
    localStorage.removeItem('lumina_role')
  }

  const value = useMemo(() => ({
    token,
    isAuthenticated: !!token,
    logout,
  }), [token])

  return (
    <AuthStoreContext.Provider value={value}>
      {children}
    </AuthStoreContext.Provider>
  )
}

export function useAuthStore() {
  const ctx = useContext(AuthStoreContext)
  if (!ctx) throw new Error('useAuthStore must be used within AuthStoreProvider')
  return ctx
}
