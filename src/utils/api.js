/**
 * Lumina Ops — API Client
 *
 * All functions in this file make real HTTP calls to the Go backend.
 * During prototype phase, these are stubbed to use local state (db).
 * When the backend is ready, replace each stub with the real fetch call.
 *
 * Base URL: /api/v1 (proxied to Go server via vite.config.js in dev)
 */

const BASE = '/api/v1'

// Auth token storage
let _token = localStorage.getItem('lumina_token') || null

export const setToken = (t) => { _token = t; localStorage.setItem('lumina_token', t) }
export const clearToken = () => { _token = null; localStorage.removeItem('lumina_token') }
export const getToken = () => _token

const headers = () => ({
  'Content-Type': 'application/json',
  ..._token ? { Authorization: `Bearer ${_token}` } : {},
})

const request = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (res.status === 401) { clearToken(); window.location.href = '/login'; return }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login:         (email, password)    => request('POST', '/auth/login', { email, password }),
    logout:        ()                   => request('POST', '/auth/logout'),
    resetPassword: (email)              => request('POST', '/auth/reset-password', { email }),
  },

  // ── Employers ───────────────────────────────────────────────────────────────
  employers: {
    list:          ()                   => request('GET',  '/employers'),
    get:           (id)                 => request('GET',  `/employers/${id}`),
    create:        (data)               => request('POST', '/employers', data),
    update:        (id, data)           => request('PUT',  `/employers/${id}`, data),
    updateBanking: (id, banking)        => request('PUT',  `/employers/${id}/banking`, banking),
  },

  // ── Practices ───────────────────────────────────────────────────────────────
  practices: {
    list:          ()                   => request('GET',  '/practices'),
    get:           (id)                 => request('GET',  `/practices/${id}`),
    create:        (data)               => request('POST', '/practices', data),
    update:        (id, data)           => request('PUT',  `/practices/${id}`, data),
    updateRates:   (id, rates)          => request('PUT',  `/practices/${id}/rates`, rates),
    updateBanking: (id, banking)        => request('PUT',  `/practices/${id}/banking`, banking),
    addContract:   (id, contract)       => request('POST', `/practices/${id}/contracts`, contract),
  },

  // ── Clinicians ───────────────────────────────────────────────────────────────
  clinicians: {
    listByPractice:(practiceId)         => request('GET',  `/practices/${practiceId}/clinicians`),
    create:        (practiceId, data)   => request('POST', `/practices/${practiceId}/clinicians`, data),
    update:        (id, data)           => request('PUT',  `/clinicians/${id}`, data),
  },

  // ── Clients ──────────────────────────────────────────────────────────────────
  clients: {
    list:          (filters)            => request('GET',  `/clients?${new URLSearchParams(filters || {})}`),
    get:           (id)                 => request('GET',  `/clients/${id}`),
    create:        (data)               => request('POST', '/clients', data),
    updateStatus:  (id, status)         => request('PUT',  `/clients/${id}/status`, { status }),
  },

  // ── Referrals ────────────────────────────────────────────────────────────────
  referrals: {
    list:          (filters)            => request('GET',  `/referrals?${new URLSearchParams(filters || {})}`),
    get:           (id)                 => request('GET',  `/referrals/${id}`),
    create:        (data)               => request('POST', '/referrals', data),
    update:        (id, data)           => request('PUT',  `/referrals/${id}`, data),
    confirm:       (id, clientName)     => request('PUT',  `/referrals/${id}/confirm`, { clientName }),
    markContacted: (id)                 => request('PUT',  `/referrals/${id}/contacted`),
    markBooked:    (id)                 => request('PUT',  `/referrals/${id}/booked`),
  },

  // ── Sessions ─────────────────────────────────────────────────────────────────
  sessions: {
    list:          (filters)            => request('GET',  `/sessions?${new URLSearchParams(filters || {})}`),
    create:        (data)               => request('POST', '/sessions', data),
  },

  // ── Assessments ──────────────────────────────────────────────────────────────
  assessments: {
    listByClient:  (clientId)           => request('GET',  `/clients/${clientId}/assessments`),
    sendLink:      (clientId, type)     => request('POST', '/assessments/send', { clientId, type }),
    // Public — no auth required (client submits via tokenized link)
    getByToken:    (token)              => fetch(`${BASE}/assessments/token/${token}`).then(r => r.json()),
    submitByToken: (token, data)        => fetch(`${BASE}/assessments/token/${token}`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(data),
                                          }).then(r => r.json()),
  },

  // ── Invoices ─────────────────────────────────────────────────────────────────
  invoices: {
    list:          (filters)            => request('GET',  `/invoices?${new URLSearchParams(filters || {})}`),
    generate:      (period)             => request('POST', '/invoices/generate', { period }),
    send:          (id)                 => request('PUT',  `/invoices/${id}/send`),
    markPaid:      (id)                 => request('PUT',  `/invoices/${id}/mark-paid`),
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
