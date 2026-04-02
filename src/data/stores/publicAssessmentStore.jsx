import React, { createContext, useContext, useMemo, useState } from 'react'
import api from '../../utils/api'

const PublicAssessmentStoreContext = createContext(null)

export function PublicAssessmentStoreProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadByToken = async (token) => {
    setLoading(true)
    setError('')
    try {
      return await api.assessments.getByToken(token)
    } catch (e) {
      setError(e?.message || 'This assessment link is invalid or has already been completed.')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const submitByToken = async (token, payload) => {
    setLoading(true)
    setError('')
    try {
      return await api.assessments.submitByToken(token, payload)
    } catch (e) {
      setError(e?.message || 'Failed to submit assessment. Please try again.')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(() => ({
    loading,
    error,
    setError,
    loadByToken,
    submitByToken,
  }), [loading, error])

  return (
    <PublicAssessmentStoreContext.Provider value={value}>
      {children}
    </PublicAssessmentStoreContext.Provider>
  )
}

export function usePublicAssessmentStore() {
  const ctx = useContext(PublicAssessmentStoreContext)
  if (!ctx) throw new Error('usePublicAssessmentStore must be used within PublicAssessmentStoreProvider')
  return ctx
}
