import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import api from '../../utils/api'

const CareStoreContext = createContext(null)

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

const REFERRALS_PAGE_LIMIT = 15
const CORE_REFERRALS_FETCH_LIMIT = 100
const CORE_CLIENTS_FETCH_LIMIT = 100

const toIsoDate = (value) => {
  if (!value) return ''
  if (typeof value !== 'string') return String(value)
  return value
}

const normalizeClientStatus = (status) => {
  return status === 'discharged' ? 'discharged' : 'active'
}

const toClient = (row = {}) => {
  const createdAt = toIsoDate(row.created_at ?? row.createdAt)
  return {
    id: row.id || '',
    anonId: row.anon_id ?? row.anonId ?? '',
    employerId: row.employer_id ?? row.employerId ?? '',
    practiceId: row.practice_id ?? row.practiceId ?? '',
    clinicianId: row.clinician_id ?? row.clinicianId ?? '',
    clientName: row.client_name ?? row.clientName ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    status: normalizeClientStatus(row.status),
    createdAt,
    updatedAt: toIsoDate(row.updated_at ?? row.updatedAt),
    // Compatibility aliases while the app finishes moving to snake_case.
    anon_id: row.anon_id ?? row.anonId ?? '',
    employer_id: row.employer_id ?? row.employerId ?? '',
    practice_id: row.practice_id ?? row.practiceId ?? '',
    client_name: row.client_name ?? row.clientName ?? '',
    created_at: createdAt,
    updated_at: toIsoDate(row.updated_at ?? row.updatedAt),
    intakeDate: createdAt ? createdAt.slice(0, 10) : '',
  }
}

const mapCreateClientPayload = (payload = {}) => ({
  ...(payload.employerId || payload.employer_id
    ? { employer_id: payload.employerId || payload.employer_id }
    : {}),
  ...(payload.practiceId || payload.practice_id
    ? { practice_id: payload.practiceId || payload.practice_id }
    : {}),
  ...(payload.clientName || payload.client_name
    ? { client_name: payload.clientName || payload.client_name }
    : {}),
  ...(payload.email ? { email: payload.email } : {}),
  ...(payload.phone ? { phone: payload.phone } : {}),
  ...(payload.status ? { status: normalizeClientStatus(payload.status) } : {}),
})

const toReferral = (row = {}) => ({
  id: row.id || '',
  anonId: row.anon_id ?? row.anonId ?? '',
  employerId: row.employer_id ?? row.employerId ?? '',
  practiceId: row.practice_id ?? row.practiceId ?? '',
  clinicianId: row.clinician_id ?? row.clinicianId ?? '',
  presNeed: row.pres_need ?? row.presNeed ?? '',
  location: row.location ?? '',
  state: row.state ?? '',
  sessionType: row.session_type ?? row.sessionType ?? 'individual',
  modality: row.modality ?? 'in-person',
  clientEmail: row.client_email ?? row.clientEmail ?? '',
  clientPhone: row.client_phone ?? row.clientPhone ?? '',
  status: row.status ?? 'pending',
  notes: row.notes ?? '',
  createdAt: toIsoDate(row.created_at ?? row.createdAt),
  scheduledAt: toIsoDate(row.scheduled_at ?? row.scheduledAt),
  practiceConfirmedAt: toIsoDate(row.practice_confirmed_at ?? row.practiceConfirmedAt),
  practiceContactedAt: toIsoDate(row.practice_contacted_at ?? row.practiceContactedAt),
  practiceSessionBookedAt: toIsoDate(row.practice_session_booked_at ?? row.practiceSessionBookedAt),
})

const toSession = (row = {}) => ({
  id: row.id || '',
  clientId: row.client_id ?? row.clientId ?? '',
  clinicianId: row.clinician_id ?? row.clinicianId ?? '',
  practiceId: row.practice_id ?? row.practiceId ?? '',
  employerId: row.employer_id ?? row.employerId ?? '',
  date: row.session_date ?? row.date ?? '',
  type: row.session_type ?? row.type ?? 'individual',
  modality: row.modality ?? 'in-person',
  feeCents: row.fee_cents ?? row.feeCents ?? 0,
  notes: row.notes ?? '',
  createdBy: row.created_by ?? row.createdBy ?? '',
  createdAt: toIsoDate(row.created_at ?? row.createdAt),
})

const mapCreateSessionPayload = (payload = {}) => {
  const body = {
    client_id: payload.clientId,
    clinician_id: payload.clinicianId,
    practice_id: payload.practiceId,
    employer_id: payload.employerId,
    session_date: payload.date,
    session_type: payload.type,
    modality: payload.modality,
  }
  if (Number.isFinite(payload.feeCents) && payload.feeCents >= 0) {
    body.fee_cents = Math.round(payload.feeCents)
  }
  if (typeof payload.notes === 'string' && payload.notes.trim()) {
    body.notes = payload.notes.trim()
  }
  return body
}

const toReferralsMeta = (meta = {}, fallbackPage = 1, fallbackLimit = REFERRALS_PAGE_LIMIT, fallbackTotal = 0) => {
  const page = Number(meta.page ?? fallbackPage) || fallbackPage
  const pageSize = Number(meta.page_size ?? meta.pageSize ?? fallbackLimit) || fallbackLimit
  const total = Number(meta.total ?? fallbackTotal) || fallbackTotal
  const totalPages = Number(meta.total_pages ?? meta.totalPages ?? (total > 0 ? Math.ceil(total / pageSize) : 1)) || 1
  return {
    page,
    limit: pageSize,
    total,
    total_pages: totalPages,
  }
}

const toClientsMeta = (meta = {}, fallbackPage = 1, fallbackLimit = CORE_CLIENTS_FETCH_LIMIT, fallbackTotal = 0) => {
  const page = Number(meta.page ?? fallbackPage) || fallbackPage
  const pageSize = Number(meta.page_size ?? meta.pageSize ?? fallbackLimit) || fallbackLimit
  const total = Number(meta.total ?? fallbackTotal) || fallbackTotal
  const totalPages = Number(meta.total_pages ?? meta.totalPages ?? (total > 0 ? Math.ceil(total / pageSize) : 1)) || 1
  return {
    page,
    limit: pageSize,
    total,
    total_pages: totalPages,
  }
}

const mapCreateReferralPayload = (payload = {}) => {
  const referral = payload?.referral || payload
  return {
    ...(referral.anonId ? { anon_id: referral.anonId } : {}),
    ...(referral.employerId ? { employer_id: referral.employerId } : {}),
    ...(payload.practiceId || referral.practiceId ? { practice_id: payload.practiceId || referral.practiceId } : {}),
    ...(payload.clinicianId || referral.clinicianId ? { clinician_id: payload.clinicianId || referral.clinicianId } : {}),
    ...(referral.presNeed ? { pres_need: referral.presNeed } : {}),
    ...(referral.location ? { location: referral.location } : {}),
    ...(referral.state ? { state: referral.state } : {}),
    ...(referral.sessionType ? { session_type: referral.sessionType } : {}),
    ...(referral.modality ? { modality: referral.modality } : {}),
    ...(referral.clientEmail ? { client_email: referral.clientEmail } : {}),
    ...(referral.clientPhone ? { client_phone: referral.clientPhone } : {}),
    ...(referral.status ? { status: referral.status } : {}),
    ...(typeof referral.notes === 'string' ? { notes: referral.notes } : {}),
    ...(referral.scheduledAt ? { scheduled_at: referral.scheduledAt } : {}),
  }
}

const mapUpdateReferralPayload = (payload = {}) => ({
  ...(payload.status ? { status: payload.status } : {}),
  ...(payload.clinicianId ? { clinician_id: payload.clinicianId } : {}),
  ...(typeof payload.notes === 'string' ? { notes: payload.notes } : {}),
  ...(payload.scheduledAt ? { scheduled_at: payload.scheduledAt } : {}),
})

export function CareStoreProvider({ children }) {
  const [clients, setClients] = useState([])
  const [referrals, setReferrals] = useState([])
  const [sessions, setSessions] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(false)
  const [coreLoaded, setCoreLoaded] = useState(false)
  const [assessmentsLoaded, setAssessmentsLoaded] = useState(false)
  const [referralsPageItems, setReferralsPageItems] = useState([])
  const [referralsPagination, setReferralsPagination] = useState({
    page: 1,
    limit: REFERRALS_PAGE_LIMIT,
    total: 0,
    total_pages: 1,
  })
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [referralsError, setReferralsError] = useState('')
  const coreInflightRef = useRef(null)
  const assessmentsInflightRef = useRef(null)
  const referralsPageInflightRef = useRef(null)
  const lastReferralsListQRef = useRef('')

  const fetchAllReferrals = async () => {
    const first = await api.referrals.list({ page: 1, limit: CORE_REFERRALS_FETCH_LIMIT })
    let rows = asArray(first).map(toReferral)
    const firstMeta = toReferralsMeta(first?.meta, 1, CORE_REFERRALS_FETCH_LIMIT, rows.length)
    if (firstMeta.total_pages <= 1) return rows

    for (let page = 2; page <= firstMeta.total_pages; page += 1) {
      const chunk = await api.referrals.list({ page, limit: firstMeta.limit })
      rows = rows.concat(asArray(chunk).map(toReferral))
    }
    return rows
  }

  const fetchAllClients = async () => {
    const first = await api.clients.list({ page: 1, limit: CORE_CLIENTS_FETCH_LIMIT })
    let rows = asArray(first).map(toClient)
    const firstMeta = toClientsMeta(first?.meta, 1, CORE_CLIENTS_FETCH_LIMIT, rows.length)
    if (firstMeta.total_pages <= 1) return rows

    for (let page = 2; page <= firstMeta.total_pages; page += 1) {
      const chunk = await api.clients.list({ page, limit: firstMeta.limit })
      rows = rows.concat(asArray(chunk).map(toClient))
    }
    return rows
  }

  const loadReferralsPage = async ({ page = 1, limit = REFERRALS_PAGE_LIMIT, q, force = false } = {}) => {
    const qNorm = typeof q === 'string' ? q.trim() : ''

    if (
      !force &&
      referralsPagination.page === page &&
      referralsPagination.limit === limit &&
      lastReferralsListQRef.current === qNorm &&
      referralsPageItems.length > 0
    ) {
      return
    }
    if (referralsPageInflightRef.current && !force) return referralsPageInflightRef.current

    const run = (async () => {
      setReferralsLoading(true)
      setReferralsError('')
      try {
        const query = { page, limit, ...(qNorm ? { q: qNorm } : {}) }
        const response = await api.referrals.list(query)
        const rows = asArray(response).map(toReferral)
        setReferralsPageItems(rows)
        setReferralsPagination(toReferralsMeta(response?.meta, page, limit, rows.length))
        lastReferralsListQRef.current = qNorm
      } catch (err) {
        setReferralsError(err?.message || 'Failed to load referrals.')
        throw err
      } finally {
        setReferralsLoading(false)
      }
    })()

    referralsPageInflightRef.current = run
    await run
    referralsPageInflightRef.current = null
  }

  const ensureCoreLoadedRef = useRef(null)
  ensureCoreLoadedRef.current = async ({ force = false } = {}) => {
    if (coreLoaded && !force) return
    if (coreInflightRef.current && !force) return coreInflightRef.current

    const run = (async () => {
      setLoading(true)
      const clientsList = await safe(() => fetchAllClients(), [])
      const referralsList = await safe(() => fetchAllReferrals(), [])
      const sessionsList = asArray(await safe(() => api.sessions.list(), [])).map(toSession)

      setClients(clientsList)
      setReferrals(referralsList)
      setSessions(sessionsList)
      const currentPage = force ? 1 : referralsPagination.page
      const currentLimit = referralsPagination.limit || REFERRALS_PAGE_LIMIT
      await safe(() => loadReferralsPage({ page: currentPage, limit: currentLimit, q: lastReferralsListQRef.current, force: true }), null)
      setCoreLoaded(true)
      setLoading(false)
    })()

    coreInflightRef.current = run
    await run
    coreInflightRef.current = null
  }

  const ensureCoreLoaded = useCallback((o) => ensureCoreLoadedRef.current(o), [])

  const ensureAssessmentsLoadedRef = useRef(null)
  ensureAssessmentsLoadedRef.current = async ({ force = false } = {}) => {
    if (assessmentsLoaded && !force) return
    if (assessmentsInflightRef.current && !force) return assessmentsInflightRef.current

    const run = (async () => {
      await ensureCoreLoaded({ force })
      setLoading(true)
      const sourceClients = Array.isArray(clients) && clients.length
        ? clients
        : await safe(() => fetchAllClients(), [])
      const assessmentsNested = await Promise.all(
        sourceClients.map((c) => safe(() => api.assessments.listByClient(c.id), []))
      )
      setAssessments(assessmentsNested.flatMap((chunk) => asArray(chunk)))
      setAssessmentsLoaded(true)
      setLoading(false)
    })()

    assessmentsInflightRef.current = run
    await run
    assessmentsInflightRef.current = null
  }

  const ensureAssessmentsLoaded = useCallback((o) => ensureAssessmentsLoadedRef.current(o), [])

  const ensureLoadedRef = useRef(null)
  ensureLoadedRef.current = async ({ force = false } = {}) => {
    await ensureCoreLoaded({ force })
    await ensureAssessmentsLoaded({ force })
  }

  const ensureLoaded = useCallback((o) => ensureLoadedRef.current(o), [])

  const addClient = async (payload) => {
    await api.clients.create(mapCreateClientPayload(payload))
    await ensureLoaded({ force: true })
  }

  const updateClientStatus = async (id, status) => {
    if (!id) throw new Error('Client id is required.')
    await api.clients.updateStatus(id, normalizeClientStatus(status))
    await ensureLoaded({ force: true })
  }

  const addReferral = async (payload) => {
    await api.referrals.create(mapCreateReferralPayload(payload))
    await ensureCoreLoaded({ force: true })
    await loadReferralsPage({
      page: referralsPagination.page || 1,
      limit: referralsPagination.limit || REFERRALS_PAGE_LIMIT,
      q: lastReferralsListQRef.current,
      force: true,
    })
  }

  const updateReferral = async (payload) => {
    const { id, ...data } = payload || {}
    await api.referrals.update(id, mapUpdateReferralPayload(data))
    await ensureCoreLoaded({ force: true })
    await loadReferralsPage({
      page: referralsPagination.page || 1,
      limit: referralsPagination.limit || REFERRALS_PAGE_LIMIT,
      q: lastReferralsListQRef.current,
      force: true,
    })
  }

  const confirmReferral = async ({ refId, clientName }) => {
    await api.referrals.confirm(refId, clientName)
    await ensureCoreLoaded({ force: true })
    await loadReferralsPage({
      page: referralsPagination.page || 1,
      limit: referralsPagination.limit || REFERRALS_PAGE_LIMIT,
      q: lastReferralsListQRef.current,
      force: true,
    })
  }

  const markReferralContacted = async (id) => {
    await api.referrals.markContacted(id)
    await ensureCoreLoaded({ force: true })
    await loadReferralsPage({
      page: referralsPagination.page || 1,
      limit: referralsPagination.limit || REFERRALS_PAGE_LIMIT,
      q: lastReferralsListQRef.current,
      force: true,
    })
  }

  const markReferralBooked = async (id) => {
    await api.referrals.markBooked(id)
    await ensureCoreLoaded({ force: true })
    await loadReferralsPage({
      page: referralsPagination.page || 1,
      limit: referralsPagination.limit || REFERRALS_PAGE_LIMIT,
      q: lastReferralsListQRef.current,
      force: true,
    })
  }

  const addSession = async (payload) => {
    const mapped = mapCreateSessionPayload(payload)
    const missing = ['client_id', 'clinician_id', 'practice_id', 'employer_id', 'session_date', 'session_type', 'modality'].filter(
      (k) => !mapped[k]
    )
    if (missing.length) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
    await api.sessions.create(mapped)
    await ensureLoaded({ force: true })
  }

  const deleteSession = async (id) => {
    await api.sessions.delete(id)
    await ensureLoaded({ force: true })
  }

  const sendAssessment = async ({ clientId, type }) => {
    await api.assessments.sendLink(clientId, type)
    await ensureLoaded({ force: true })
    const pending = assessments.find((a) =>
      a.clientId === clientId && a.type === type && a.completed === false && a.token
    )
    return pending?.token || null
  }

  const completeAssessment = async ({ token, clientId, type, answers, score }) => {
    let t = token
    if (!t) {
      const pending = assessments.find((a) =>
        a.clientId === clientId && a.type === type && a.completed === false && a.token
      )
      t = pending?.token
    }
    if (!t) throw new Error('Missing assessment token for completion')
    await api.assessments.submitByToken(t, { answers, score, completedAt: new Date().toISOString() })
    await ensureLoaded({ force: true })
  }

  const value = useMemo(() => ({
    clients,
    referrals,
    referrals_page_items: referralsPageItems,
    referrals_pagination: referralsPagination,
    referrals_loading: referralsLoading,
    referrals_error: referralsError,
    sessions,
    assessments,
    loading,
    coreLoaded,
    assessmentsLoaded,
    ensureLoaded,
    ensureCoreLoaded,
    ensureAssessmentsLoaded,
    load_referrals_page: loadReferralsPage,
    addClient,
    updateClientStatus,
    addReferral,
    updateReferral,
    confirmReferral,
    markReferralContacted,
    markReferralBooked,
    addSession,
    deleteSession,
    sendAssessment,
    completeAssessment,
  }), [
    clients,
    referrals,
    referralsPageItems,
    referralsPagination,
    referralsLoading,
    referralsError,
    sessions,
    assessments,
    loading,
    coreLoaded,
    assessmentsLoaded,
  ])

  return (
    <CareStoreContext.Provider value={value}>
      {children}
    </CareStoreContext.Provider>
  )
}

export function useCareStore() {
  const ctx = useContext(CareStoreContext)
  if (!ctx) throw new Error('useCareStore must be used within CareStoreProvider')
  return ctx
}
