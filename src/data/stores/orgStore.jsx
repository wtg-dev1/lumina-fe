import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import api from '../../utils/api'

const OrgStoreContext = createContext(null)

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

const firstItem = (payload) => {
  if (!payload) return null
  if (Array.isArray(payload)) return payload[0] || null
  if (Array.isArray(payload?.items)) return payload.items[0] || null
  if (Array.isArray(payload?.data)) return payload.data[0] || null
  if (Array.isArray(payload?.results)) return payload.results[0] || null
  if (payload?.data && typeof payload.data === 'object') return payload.data
  if (payload?.id) return payload
  return null
}

const toEmployer = (row = {}) => ({
  id: row.id,
  name: row.name || '',
  contact_name: row.contact_name ?? row.contact ?? '',
  contact_email: row.contact_email ?? row.email ?? '',
  billing_method: row.billing_method ?? row.billing ?? 'invoice',
  admin_fee_cents: row.admin_fee_cents ?? row.adminFeeCents ?? 0,
  admin_fee_anchor_month: row.admin_fee_anchor_month ?? row.adminFeeAnchorMonth ?? null,
  active: row.active !== false,
  created_at: row.created_at ?? row.createdAt ?? '',
  // Compatibility aliases while non-employer views are migrated.
  contact: row.contact ?? row.contact_name ?? '',
  email: row.email ?? row.contact_email ?? '',
  billing: row.billing ?? row.billing_method ?? 'invoice',
  adminFeeCents: row.adminFeeCents ?? row.admin_fee_cents ?? 0,
  adminFeeAnchorMonth: row.adminFeeAnchorMonth ?? row.admin_fee_anchor_month ?? null,
})

const toEmployerBanking = (row = {}) => ({
  id: row.id,
  employer_id: row.employer_id ?? row.employerId ?? '',
  bank_name: row.bank_name ?? row.bankName ?? '',
  routing: row.routing ?? '',
  account_number: row.account_number ?? row.account ?? '',
  account_type: row.account_type ?? row.accountType ?? 'checking',
  billing_contact: row.billing_contact ?? row.billingContact ?? '',
  billing_email: row.billing_email ?? row.billingEmail ?? '',
  created_at: row.created_at ?? row.createdAt ?? '',
})

const toPractice = (row = {}) => ({
  ...row,
  contact_name: row.contact_name ?? row.contact ?? '',
  contact_email: row.contact_email ?? row.email ?? '',
  rate_individual: row.rate_individual ?? row.rateIndividual ?? 0,
  rate_couple: row.rate_couple ?? row.rateCouple ?? 0,
  rate_psychiatry: row.rate_psychiatry ?? row.ratePsychiatry ?? 0,
  // Compatibility aliases while other views still read camelCase.
  contact: row.contact ?? row.contact_name ?? '',
  email: row.email ?? row.contact_email ?? '',
  rateIndividual: row.rateIndividual ?? row.rate_individual ?? 0,
  rateCouple: row.rateCouple ?? row.rate_couple ?? 0,
  ratePsychiatry: row.ratePsychiatry ?? row.rate_psychiatry ?? 0,
  banking: row.banking ? toEmployerBanking(row.banking) : null,
})

const toContract = (row = {}) => ({
  id: row.id,
  practice_id: row.practice_id ?? row.practiceId ?? '',
  employer_id: row.employer_id ?? row.employerId ?? '',
  type: row.type,
  billing_model: row.billing_model ?? row.billingModel ?? '',
  rate_cents: row.rate_cents ?? row.rate ?? 0,
  units: row.units ?? null,
  margin_percent: row.margin_percent ?? row.margin ?? 0,
  label: row.label ?? '',
  effective_date: row.effective_date ?? row.effectiveDate ?? '',
  active: row.active !== false,
  created_at: row.created_at ?? row.createdAt ?? '',
  // Compatibility aliases
  practiceId: row.practiceId ?? row.practice_id ?? '',
  employerId: row.employerId ?? row.employer_id ?? '',
  billingModel: row.billingModel ?? row.billing_model ?? '',
  rate: row.rate ?? row.rate_cents ?? 0,
  margin: row.margin ?? row.margin_percent ?? 0,
  effectiveDate: row.effectiveDate ?? row.effective_date ?? '',
})

const toClinician = (row = {}) => ({
  id: row.id,
  practice_id: row.practice_id ?? row.practiceId ?? '',
  name: row.name ?? '',
  credential: row.credential ?? '',
  specialty: row.specialty ?? '',
  active: row.active !== false,
  created_at: row.created_at ?? row.createdAt ?? '',
  // Compatibility aliases while views migrate.
  practiceId: row.practiceId ?? row.practice_id ?? '',
  createdAt: row.createdAt ?? row.created_at ?? '',
})

export function OrgStoreProvider({ children }) {
  const [employers, setEmployers] = useState([])
  const [employersPageItems, setEmployersPageItems] = useState([])
  const [employersPagination, setEmployersPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 1,
  })
  const [employersLoading, setEmployersLoading] = useState(false)
  const [employersError, setEmployersError] = useState('')

  const [practices, setPractices] = useState([])
  const [practicesPageItems, setPracticesPageItems] = useState([])
  const [practicesPagination, setPracticesPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 1,
  })
  const [practicesLoading, setPracticesLoading] = useState(false)
  const [practicesError, setPracticesError] = useState('')
  const [clinicians, setClinicians] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summaryLoaded, setSummaryLoaded] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const summaryInflightRef = useRef(null)
  const inflightRef = useRef(null)
  const employersPageInflightRef = useRef(null)
  const practicesPageInflightRef = useRef(null)
  const lastEmployersListQRef = useRef('')
  const lastPracticesListQRef = useRef('')

  const loadEmployersPage = async ({ page = 1, limit = 15, q, force = false } = {}) => {
    const qNorm = typeof q === 'string' ? q.trim() : ''

    if (
      !force &&
      employersPagination.page === page &&
      employersPagination.limit === limit &&
      lastEmployersListQRef.current === qNorm &&
      employersPageItems.length > 0
    ) return
    if (employersPageInflightRef.current && !force) return employersPageInflightRef.current

    const run = (async () => {
      setEmployersLoading(true)
      setEmployersError('')
      const query = { page, limit, ...(qNorm ? { q: qNorm } : {}) }
      const response = await api.employers.list(query)
      const items = asArray(response?.data || response).map(toEmployer)
      const meta = response?.meta || {}
      setEmployersPageItems(items)
      setEmployersPagination({
        page: Number(meta.page || page),
        limit: Number(meta.page_size || limit),
        total: Number(meta.total || items.length),
        total_pages: Number(meta.total_pages || 1),
      })
      lastEmployersListQRef.current = qNorm
      setEmployersLoading(false)
    })()

    employersPageInflightRef.current = run
    try {
      await run
    } catch (e) {
      setEmployersError(e?.message || 'Failed to load employers.')
      setEmployersLoading(false)
      throw e
    } finally {
      employersPageInflightRef.current = null
    }
  }

  const loadPracticesPage = async ({ page = 1, limit = 15, q, force = false } = {}) => {
    const qNorm = typeof q === 'string' ? q.trim() : ''

    if (
      !force &&
      practicesPagination.page === page &&
      practicesPagination.limit === limit &&
      lastPracticesListQRef.current === qNorm &&
      practicesPageItems.length > 0
    ) return
    if (practicesPageInflightRef.current && !force) return practicesPageInflightRef.current

    const run = (async () => {
      setPracticesLoading(true)
      setPracticesError('')
      const query = { page, limit, ...(qNorm ? { q: qNorm } : {}) }
      const response = await api.practices.list(query)
      const items = asArray(response?.data || response).map(toPractice)
      const meta = response?.meta || {}
      setPracticesPageItems(items)
      setPracticesPagination({
        page: Number(meta.page || page),
        limit: Number(meta.page_size || limit),
        total: Number(meta.total || items.length),
        total_pages: Number(meta.total_pages || 1),
      })
      lastPracticesListQRef.current = qNorm
      setPracticesLoading(false)
    })()

    practicesPageInflightRef.current = run
    try {
      await run
    } catch (e) {
      setPracticesError(e?.message || 'Failed to load practices.')
      setPracticesLoading(false)
      throw e
    } finally {
      practicesPageInflightRef.current = null
    }
  }

  const loadAllEmployers = async () => {
    const pageSize = 100
    let page = 1
    let totalPages = 1
    const next = []
    while (page <= totalPages) {
      const response = await api.employers.list({ page, limit: pageSize })
      const items = asArray(response?.data || response).map(toEmployer)
      const meta = response?.meta || {}
      totalPages = Number(meta.total_pages || 1)
      next.push(...items)
      page += 1
    }
    const bankingsNested = await Promise.all(
      next.map((e) => safe(() => api.employerBanking.list(e.id), []))
    )
    const withBanking = next.map((employer, idx) => ({
      ...employer,
      banking: asArray(bankingsNested[idx]).map(toEmployerBanking)[0] || null,
    }))
    setEmployers(withBanking)
    return withBanking
  }

  const loadAllEmployersBasic = async () => {
    const pageSize = 100
    let page = 1
    let totalPages = 1
    const next = []
    while (page <= totalPages) {
      const response = await api.employers.list({ page, limit: pageSize })
      const items = asArray(response?.data || response).map(toEmployer)
      const meta = response?.meta || {}
      totalPages = Number(meta.total_pages || 1)
      next.push(...items)
      page += 1
    }
    setEmployers(next)
    return next
  }

  const loadAllPracticesBasic = async () => {
    const pageSize = 100
    let page = 1
    let totalPages = 1
    const next = []
    while (page <= totalPages) {
      const response = await api.practices.list({ page, limit: pageSize })
      const items = asArray(response?.data || response).map(toPractice)
      const meta = response?.meta || {}
      totalPages = Number(meta.total_pages || 1)
      next.push(...items)
      page += 1
    }
    setPractices(next)
    return next
  }

  const loadAllCliniciansForPractice = async (practiceId) => {
    if (!practiceId) return []
    const pageSize = 100
    let page = 1
    let totalPages = 1
    const next = []
    while (page <= totalPages) {
      const response = await api.clinicians.listByPractice(practiceId, { page, limit: pageSize })
      const items = asArray(response?.data || response).map(toClinician)
      const meta = response?.meta || {}
      totalPages = Number(meta.total_pages || 1)
      next.push(...items)
      page += 1
    }
    return next
  }

  const loadCliniciansPage = async ({ practiceId, page = 1, limit = 15 } = {}) => {
    if (!practiceId) {
      return {
        items: [],
        pagination: { page: 1, limit, total: 0, total_pages: 1 },
      }
    }
    const response = await api.clinicians.listByPractice(practiceId, { page, limit })
    const items = asArray(response?.data || response).map(toClinician)
    const meta = response?.meta || {}
    return {
      items,
      pagination: {
        page: Number(meta.page || page),
        limit: Number(meta.page_size || limit),
        total: Number(meta.total || items.length),
        total_pages: Number(meta.total_pages || 1),
      },
    }
  }

  // Stable identities: `loading` / `error` updates must not recreate these, or any
  // `useEffect(..., [org.ensureSummaryLoaded])` will re-fire and spam the API on failure.
  const ensureSummaryLoadedRef = useRef(null)
  ensureSummaryLoadedRef.current = async ({ force = false } = {}) => {
    if (summaryLoaded && !force) return
    if (summaryInflightRef.current && !force) return summaryInflightRef.current

    const run = (async () => {
      setLoading(true)
      setError('')
      await Promise.all([
        loadAllEmployersBasic(),
        loadAllPracticesBasic(),
      ])
      setSummaryLoaded(true)
      setLoading(false)
    })()

    summaryInflightRef.current = run
    try {
      await run
    } catch (e) {
      setError(e?.message || 'Failed to load organization summary.')
      setLoading(false)
      setSummaryLoaded(true)
    } finally {
      summaryInflightRef.current = null
    }
  }

  const ensureSummaryLoaded = useCallback((opts) => ensureSummaryLoadedRef.current(opts), [])

  const ensureLoadedRef = useRef(null)
  ensureLoadedRef.current = async ({ force = false } = {}) => {
    if (loaded && !force) return
    if (inflightRef.current && !force) return inflightRef.current

    const run = (async () => {
      await ensureSummaryLoaded({ force })
      setLoading(true)
      setError('')
      await loadAllEmployers()
      const pageSize = 15
      let page = 1
      let totalPages = 1
      const practicesBase = []
      while (page <= totalPages) {
        const response = await api.practices.list({ page, limit: pageSize })
        const items = asArray(response?.data || response)
        const meta = response?.meta || {}
        totalPages = Number(meta.total_pages || 1)
        practicesBase.push(...items)
        page += 1
      }

      const bankingNested = await Promise.all(
        practicesBase.map((p) => safe(() => api.practiceBanking.list(p.id), []))
      )
      const practicesWithBanking = practicesBase.map((practice, idx) => {
        const bankingRow = firstItem(bankingNested[idx]) || firstItem(practice?.banking)
        return {
          ...practice,
          banking: bankingRow ? toEmployerBanking(bankingRow) : null,
        }
      })
      const cliniciansNested = await Promise.all(
        practicesWithBanking.map((p) => safe(() => loadAllCliniciansForPractice(p.id), []))
      )
      const contractsNested = await Promise.all(
        practicesWithBanking.map((p) => safe(() => api.contracts.list(p.id), []))
      )

      setPractices(practicesWithBanking.map(toPractice))
      setClinicians(cliniciansNested.flatMap((chunk) => asArray(chunk)).map(toClinician))
      setContracts(contractsNested.flatMap((chunk) => asArray(chunk)).map(toContract))
      setSummaryLoaded(true)
      setLoaded(true)
      setLoading(false)
    })()

    inflightRef.current = run
    try {
      await run
    } catch (e) {
      setError(e?.message || 'Failed to load organization data.')
      setLoading(false)
      throw e
    } finally {
      inflightRef.current = null
    }
  }

  const ensureLoaded = useCallback((opts) => ensureLoadedRef.current(opts), [])

  const addEmployer = async (payload) => {
    await api.employers.create(payload)
    await loadAllEmployers()
    await loadEmployersPage({
      page: employersPagination.page,
      limit: employersPagination.limit,
      q: lastEmployersListQRef.current,
      force: true,
    })
  }

  const updateEmployer = async (payload, { banking_id = null } = {}) => {
    const { id, banking, ...rest } = payload || {}
    if (banking && banking_id) await api.employerBanking.update(id, banking_id, banking)
    else if (banking) await api.employerBanking.create(id, banking)
    else await api.employers.update(id, rest)
    await loadAllEmployers()
    await loadEmployersPage({
      page: employersPagination.page,
      limit: employersPagination.limit,
      q: lastEmployersListQRef.current,
      force: true,
    })
  }

  const deleteEmployer = async (id) => {
    await api.employers.delete(id)
    const nextPage = Math.min(
      employersPagination.page,
      Math.max(1, employersPagination.total_pages - 1)
    )
    await loadAllEmployers()
    await loadEmployersPage({ page: nextPage, limit: employersPagination.limit, q: lastEmployersListQRef.current, force: true })
  }

  const addPractice = async (payload) => {
    await api.practices.create(payload)
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const updatePractice = async (payload) => {
    const {
      id,
      banking,
      banking_id,
      rate_individual,
      rate_couple,
      rate_psychiatry,
      ...rest
    } = payload || {}
    const hasRates =
      rate_individual !== undefined ||
      rate_couple !== undefined ||
      rate_psychiatry !== undefined

    if (banking && Object.keys(banking).length > 0) {
      const targetBankingId = banking_id || banking.id || null
      const bankingPayload = { ...banking }
      delete bankingPayload.id
      delete bankingPayload.practice_id
      delete bankingPayload.created_at
      if (targetBankingId) await api.practiceBanking.update(id, targetBankingId, bankingPayload)
      else await api.practiceBanking.create(id, bankingPayload)
    }

    if (hasRates) {
      const nextRates = {}
      if (rate_individual !== undefined) nextRates.rate_individual = rate_individual
      if (rate_couple !== undefined) nextRates.rate_couple = rate_couple
      if (rate_psychiatry !== undefined) nextRates.rate_psychiatry = rate_psychiatry
      await api.practices.updateRates(id, nextRates)
    }

    if (Object.keys(rest).length > 0) {
      await api.practices.update(id, rest)
    }

    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const addContract = async (payload) => {
    const { practice_id, ...contract } = payload || {}
    await api.contracts.create(practice_id, { practice_id, ...contract })
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const addClinician = async (payload) => {
    const practiceId = payload?.practice_id || payload?.practiceId
    if (!practiceId) throw new Error('Practice is required.')
    await api.clinicians.create(practiceId, payload)
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const updateClinician = async (payload) => {
    const practiceId = payload?.practice_id || payload?.practiceId
    const clinicianId = payload?.id
    if (!practiceId || !clinicianId) throw new Error('Practice and clinician are required.')
    const { id, ...rest } = payload || {}
    await api.clinicians.update(practiceId, clinicianId, rest)
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      force: true,
    })
  }

  const deleteClinician = async ({ practice_id, practiceId, id }) => {
    const targetPracticeId = practice_id || practiceId
    if (!targetPracticeId || !id) throw new Error('Practice and clinician are required.')
    await api.clinicians.delete(targetPracticeId, id)
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const updateContract = async ({ practice_id, id, ...payload }) => {
    await api.contracts.update(practice_id, id, { practice_id, ...payload })
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const deleteContract = async ({ practice_id, id }) => {
    await api.contracts.delete(practice_id, id)
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const setContractActive = async ({ practice_id, id, active }) => {
    if (active) await api.contracts.activate(practice_id, id)
    else await api.contracts.deactivate(practice_id, id)
    await ensureLoaded({ force: true })
    await loadPracticesPage({
      page: practicesPagination.page,
      limit: practicesPagination.limit,
      q: lastPracticesListQRef.current,
      force: true,
    })
  }

  const value = useMemo(() => ({
    employers,
    employers_page_items: employersPageItems,
    employers_pagination: employersPagination,
    employers_loading: employersLoading,
    employers_error: employersError,
    practices,
    practices_page_items: practicesPageItems,
    practices_pagination: practicesPagination,
    practices_loading: practicesLoading,
    practices_error: practicesError,
    clinicians,
    contracts,
    loading,
    error,
    summaryLoaded,
    detailsLoaded: loaded,
    ensureSummaryLoaded,
    ensureDetailsLoaded: ensureLoaded,
    ensureLoaded,
    load_employers_page: loadEmployersPage,
    load_practices_page: loadPracticesPage,
    load_all_employers: loadAllEmployers,
    addEmployer,
    updateEmployer,
    deleteEmployer,
    addPractice,
    updatePractice,
    addContract,
    updateContract,
    deleteContract,
    setContractActive,
    load_clinicians_page: loadCliniciansPage,
    addClinician,
    updateClinician,
    deleteClinician,
  }), [
    employers,
    employersPageItems,
    employersPagination,
    employersLoading,
    employersError,
    practices,
    practicesPageItems,
    practicesPagination,
    practicesLoading,
    practicesError,
    clinicians,
    contracts,
    loading,
    error,
    summaryLoaded,
    loaded,
  ])

  return (
    <OrgStoreContext.Provider value={value}>
      {children}
    </OrgStoreContext.Provider>
  )
}

export function useOrgStore() {
  const ctx = useContext(OrgStoreContext)
  if (!ctx) throw new Error('useOrgStore must be used within OrgStoreProvider')
  return ctx
}
