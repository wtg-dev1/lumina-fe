import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import api from '../../utils/api'

const FinanceStoreContext = createContext(null)

const safe = async (fn, fallback) => {
  try { return await fn() } catch { return fallback }
}

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const loadAllEmployerIds = async () => {
  const ids = []
  let page = 1
  let totalPages = 1
  while (page <= totalPages) {
    const res = await api.employers.list({ page, limit: 100 })
    const items = asArray(res?.data || res)
    ids.push(...items.map((e) => e.id))
    totalPages = Number(res?.meta?.total_pages || 1)
    page += 1
  }
  return ids
}

export function FinanceStoreProvider({ children }) {
  const [invoices, setInvoices] = useState([])
  const [adminFees, setAdminFees] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [summaryLoaded, setSummaryLoaded] = useState(false)
  const [adminFeesLoaded, setAdminFeesLoaded] = useState(false)
  const summaryInflightRef = useRef(null)
  const adminFeesInflightRef = useRef(null)

  const ensureSummaryLoadedRef = useRef(null)
  ensureSummaryLoadedRef.current = async ({ force = false } = {}) => {
    if (summaryLoaded && !force) return
    if (summaryInflightRef.current && !force) return summaryInflightRef.current

    const run = (async () => {
      setLoading(true)
      const nextInvoices = asArray(await safe(() => api.invoices.list(), []))
      const nextPayouts = asArray(await safe(() => api.payouts.list(), []))
      setInvoices(nextInvoices)
      setPayouts(nextPayouts)
      setSummaryLoaded(true)
      setLoading(false)
    })()

    summaryInflightRef.current = run
    await run
    summaryInflightRef.current = null
  }

  const ensureSummaryLoaded = useCallback((o) => ensureSummaryLoadedRef.current(o), [])

  const ensureAdminFeesLoadedRef = useRef(null)
  ensureAdminFeesLoadedRef.current = async ({ force = false, employerIds = [] } = {}) => {
    if (adminFeesLoaded && !force) return
    if (adminFeesInflightRef.current && !force) return adminFeesInflightRef.current

    const run = (async () => {
      setLoading(true)
      let feeSources = employerIds
      if (!feeSources.length) {
        feeSources = await safe(() => loadAllEmployerIds(), [])
      }
      const adminFeesNested = await Promise.all(
        feeSources.map((id) => safe(() => api.adminFees.list(id), []))
      )
      setAdminFees(adminFeesNested.flatMap((chunk) => asArray(chunk)))
      setAdminFeesLoaded(true)
      setLoading(false)
    })()

    adminFeesInflightRef.current = run
    await run
    adminFeesInflightRef.current = null
  }

  const ensureAdminFeesLoaded = useCallback((o) => ensureAdminFeesLoadedRef.current(o), [])

  const ensureLoadedRef = useRef(null)
  ensureLoadedRef.current = async ({ force = false, employerIds = [] } = {}) => {
    await ensureSummaryLoaded({ force })
    await ensureAdminFeesLoaded({ force, employerIds })
  }

  const ensureLoaded = useCallback((o) => ensureLoadedRef.current(o), [])

  const addAdminFee = async (payload) => {
    await api.adminFees.create(payload)
    await ensureLoaded({ force: true, employerIds: [payload.employerId] })
  }

  const updateAdminFee = async ({ id, status }) => {
    await api.adminFees.updateStatus(id, status)
    await ensureLoaded({ force: true })
  }

  const getInvoice = (id) => api.invoices.get(id)

  const runInvoicing = async ({ forDate } = {}) => {
    const body = forDate ? { for_date: forDate } : {}
    const report = await api.invoices.run(body)
    await ensureSummaryLoaded({ force: true })
    return report
  }

  const updatePayoutStatus = async ({ id, status }) => {
    if (status === 'processing') await api.payouts.initiate(id)
    else if (status === 'paid') await api.payouts.markPaid(id)
    await ensureLoaded({ force: true })
  }

  const value = useMemo(() => ({
    invoices,
    adminFees,
    payouts,
    loading,
    summaryLoaded,
    adminFeesLoaded,
    ensureLoaded,
    ensureSummaryLoaded,
    ensureAdminFeesLoaded,
    addAdminFee,
    updateAdminFee,
    getInvoice,
    runInvoicing,
    updatePayoutStatus,
  }), [invoices, adminFees, payouts, loading, summaryLoaded, adminFeesLoaded])

  return (
    <FinanceStoreContext.Provider value={value}>
      {children}
    </FinanceStoreContext.Provider>
  )
}

export function useFinanceStore() {
  const ctx = useContext(FinanceStoreContext)
  if (!ctx) throw new Error('useFinanceStore must be used within FinanceStoreProvider')
  return ctx
}
