/**
 * Lumina Ops — API Client
 *
 * All functions in this file make real HTTP calls to the Go backend.
 * During prototype phase, these are stubbed to use local state (db).
 * When the backend is ready, replace each stub with the real fetch call.
 *
 * Base URL:
 * - Uses VITE_API_URL when provided (recommended for explicit backend host)
 * - Falls back to /api/v1 for vite proxy-based development
 */

const BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

// Auth token storage
let _token = localStorage.getItem('lumina_token') || null

const emitTokenChanged = (token) => {
  try {
    window.dispatchEvent(new CustomEvent('lumina:token-changed', { detail: { token } }))
  } catch {}
}

export const setToken = (t) => {
  _token = t
  localStorage.setItem('lumina_token', t)
  emitTokenChanged(t)
}

export const clearToken = () => {
  _token = null
  localStorage.removeItem('lumina_token')
  emitTokenChanged(null)
}
export const getToken = () => _token

class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const headers = () => ({
  'Content-Type': 'application/json',
  ..._token ? { Authorization: `Bearer ${_token}` } : {},
})

const extractErrorMessage = (payload, fallback) => {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors
      .map((entry) => {
        if (typeof entry === 'string') return entry
        if (entry && typeof entry === 'object') {
          if (typeof entry.message === 'string' && entry.message.trim()) return entry.message
          if (typeof entry.error === 'string' && entry.error.trim()) return entry.error
          const flat = Object.values(entry).filter((v) => typeof v === 'string' && v.trim())
          if (flat.length > 0) return flat.join(' - ')
        }
        return String(entry || '').trim()
      })
      .filter(Boolean)
      .join(' - ')
  }
  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message
  }
  if (typeof payload?.error === 'string' && payload.error.trim()) {
    return payload.error
  }
  return fallback
}

const withQuery = (path, query) => {
  const params = new URLSearchParams(query || {})
  const suffix = params.toString()
  return suffix ? `${path}?${suffix}` : path
}

const request = async (method, path, body, options = {}) => {
  const { skipAuthRedirect = false } = options
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
    credentials: 'include',
  })
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (res.status === 401 && !skipAuthRedirect) { clearToken(); window.location.href = '/login'; return }
  if (!res.ok) {
    throw new ApiError(
      extractErrorMessage(data, res.statusText || 'Request failed'),
      { status: res.status, data }
    )
  }
  if (res.status === 204) return null
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login:          (email, password)        => request('POST', '/auth/login', { email, password }, { skipAuthRedirect: true }),
    logout:         ()                       => request('POST', '/auth/logout'),
    forgotPassword: (email)                  => request('POST', '/auth/forgot-password', { email }, { skipAuthRedirect: true }),
    resetPassword:  (token, newPassword)     => request('POST', '/auth/reset-password', { token, new_password: newPassword }, { skipAuthRedirect: true }),
  },

  // ── Users (admin; requires users:* permissions) ────────────────────────────
  users: {
    list:          (query)              => request('GET',  withQuery('/users', query)),
    get:           (id)                 => request('GET',  `/users/${id}`),
    create:        (data)               => request('POST', '/users', data),
    update:        (id, data)           => request('PUT',  `/users/${id}`, data),
    delete:        (id)                 => request('DELETE', `/users/${id}`),
  },

  // ── Employers ───────────────────────────────────────────────────────────────
  employers: {
    list:          (query)              => request('GET',  withQuery('/employers', query)),
    get:           (id)                 => request('GET',  `/employers/${id}`),
    create:        (data)               => request('POST', '/employers', data),
    update:        (id, data)           => request('PUT',  `/employers/${id}`, data),
    delete:        (id)                 => request('DELETE', `/employers/${id}`),
  },

  // ── Employer Banking ────────────────────────────────────────────────────────
  employerBanking: {
    list:          (employerId)                         => request('GET',    `/employers/${employerId}/banking`),
    create:        (employerId, data)                   => request('POST',   `/employers/${employerId}/banking`, data),
    get:           (employerId, bankingId)              => request('GET',    `/employers/${employerId}/banking/${bankingId}`),
    update:        (employerId, bankingId, data)        => request('PUT',    `/employers/${employerId}/banking/${bankingId}`, data),
    delete:        (employerId, bankingId)              => request('DELETE', `/employers/${employerId}/banking/${bankingId}`),
  },

  // ── Practices ───────────────────────────────────────────────────────────────
  practices: {
    list:          (query)              => request('GET',  withQuery('/practices', query)),
    get:           (id)                 => request('GET',  `/practices/${id}`),
    create:        (data)               => request('POST', '/practices', data),
    update:        (id, data)           => request('PATCH', `/practices/${id}`, data),
    delete:        (id)                 => request('DELETE', `/practices/${id}`),
    updateRates:   (id, rates)          => request('PUT',  `/practices/${id}/rates`, rates),
    addContract:   (id, contract)       => request('POST', `/practices/${id}/contracts`, contract),
  },

  // ── Practice Banking ────────────────────────────────────────────────────────
  practiceBanking: {
    list:          (practiceId)                         => request('GET',    `/practices/${practiceId}/banking`),
    create:        (practiceId, data)                   => request('POST',   `/practices/${practiceId}/banking`, data),
    get:           (practiceId, bankingId)              => request('GET',    `/practices/${practiceId}/banking/${bankingId}`),
    update:        (practiceId, bankingId, data)        => request('PUT',    `/practices/${practiceId}/banking/${bankingId}`, data),
    delete:        (practiceId, bankingId)              => request('DELETE', `/practices/${practiceId}/banking/${bankingId}`),
  },

  // ── Contracts ───────────────────────────────────────────────────────────────
  contracts: {
    list:          (practiceId)                       => request('GET',    `/practices/${practiceId}/contracts`),
    create:        (practiceId, data)                => request('POST',   `/practices/${practiceId}/contracts`, data),
    get:           (practiceId, id)                  => request('GET',    `/practices/${practiceId}/contracts/${id}`),
    update:        (practiceId, id, data)            => request('PUT',    `/practices/${practiceId}/contracts/${id}`, data),
    delete:        (practiceId, id)                  => request('DELETE', `/practices/${practiceId}/contracts/${id}`),
    activate:      (practiceId, id)                  => request('PUT',    `/practices/${practiceId}/contracts/${id}/activate`),
    deactivate:    (practiceId, id)                  => request('PUT',    `/practices/${practiceId}/contracts/${id}/deactivate`),
  },

  // ── Clinicians ───────────────────────────────────────────────────────────────
  clinicians: {
    listByPractice:(practiceId, query)                => request('GET', withQuery(`/practices/${practiceId}/clinicians`, query)),
    get:           (practiceId, clinicianId)          => request('GET', `/practices/${practiceId}/clinicians/${clinicianId}`),
    create:        (practiceId, data)                 => request('POST', `/practices/${practiceId}/clinicians`, data),
    update:        (practiceId, clinicianId, data)    => request('PUT', `/practices/${practiceId}/clinicians/${clinicianId}`, data),
    delete:        (practiceId, clinicianId)          => request('DELETE', `/practices/${practiceId}/clinicians/${clinicianId}`),
  },

  // ── Clients ──────────────────────────────────────────────────────────────────
  clients: {
    list:          (query)              => request('GET',  withQuery('/clients', query)),
    create:        (data)               => request('POST', '/clients', data),
    updateStatus:  (id, status)         => request('PUT',  `/clients/${id}/status`, { status }),
  },

  // ── Referrals ────────────────────────────────────────────────────────────────
  referrals: {
    list:          (query)              => request('GET',  withQuery('/referrals', query)),
    get:           (id)                 => request('GET',  `/referrals/${id}`),
    create:        (data)               => request('POST', '/referrals', data),
    update:        (id, data)           => request('PUT',  `/referrals/${id}`, data),
    confirm:       (id, clientName)     => request('PUT',  `/referrals/${id}/confirm`, { clientName }),
    markContacted: (id)                 => request('PUT',  `/referrals/${id}/contacted`),
    markBooked:    (id)                 => request('PUT',  `/referrals/${id}/booked`),
  },

  // ── Sessions ─────────────────────────────────────────────────────────────────
  sessions: {
    list:          (query)              => request('GET',  withQuery('/sessions', query)),
    create:        (data)               => request('POST', '/sessions', data),
    delete:        (id)                 => request('DELETE', `/sessions/${id}`),
  },

  // ── Assessments ──────────────────────────────────────────────────────────────
  assessments: {
    statuses:         ()                                => request('GET',  '/assessments/statuses'),
    history:          (clientId, assessmentType)        => request('GET',  withQuery(`/assessments/clients/${clientId}/history`, { assessment_type: assessmentType })),
    send:             ({ clientId, assessmentType })    => request('POST', '/assessments/send', { client_id: clientId, assessment_type: assessmentType }),
    startInPerson:    ({ clientId, assessmentType })    => request('POST', '/assessments/in-person/start', { client_id: clientId, assessment_type: assessmentType }),
    completeInPerson: (id, { answers })                 => request('POST', `/assessments/${id}/in-person/complete`, { answers }),
    // Public — no auth required (client submits via tokenized link)
    publicGet:        (token)                           => request('GET',  `/public/assessments/${token}`, null, { skipAuthRedirect: true }),
    publicSubmit:     (token, { answers })              => request('POST', `/public/assessments/${token}/submit`, { answers }, { skipAuthRedirect: true }),
  },

  // ── Invoices ─────────────────────────────────────────────────────────────────
  invoices: {
    list:          (query)              => request('GET',  withQuery('/invoices', query)),
    get:           (id)                 => request('GET',  `/invoices/${id}`),
    run:           (body)               => request('POST', '/invoices/run', body || {}),
  },

  // ── Admin Fees ────────────────────────────────────────────────────────────────
  adminFees: {
    list:          (employerId)         => request('GET',  `/admin-fees?employerId=${employerId}`),
    create:        (data)               => request('POST', '/admin-fees', data),
    updateStatus:  (id, status)         => request('PUT',  `/admin-fees/${id}/status`, { status }),
    markPaid:      (id)                 => request('PUT',  `/admin-fees/${id}/mark-paid`),
  },

  // ── Payouts ──────────────────────────────────────────────────────────────────
  payouts: {
    list:          (filters)            => request('GET',  `/payouts?${new URLSearchParams(filters || {})}`),
    calculate:     (period)             => request('POST', '/payouts/calculate', { period }),
    initiate:      (id)                 => request('POST', `/payouts/${id}/initiate`),
    markPaid:      (id)                 => request('PUT',  `/payouts/${id}/mark-paid`),
  },

  // ── ROI Reports ───────────────────────────────────────────────────────────────
  reports: {
    roi:           (employerId)         => request('GET',  `/reports/roi/${employerId}`),
    sendRoi:       (employerId)         => request('POST', `/reports/roi/${employerId}/send`),
  },

  // ── Stripe ────────────────────────────────────────────────────────────────────
  stripe: {
    createConnectLink: (practiceId)     => request('POST', `/stripe/connect/${practiceId}`),
    createCustomer:    (employerId)     => request('POST', `/stripe/customer/${employerId}`),
  },
}

export default api
