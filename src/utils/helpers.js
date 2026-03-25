import { PSYPACT_STATES, LUMINA_INPERSON_STATES, C } from './constants'

// ── Currency ──────────────────────────────────────────────────────────────────
export const fmt = (cents) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

export const fmtFull = (cents) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ── Dates ─────────────────────────────────────────────────────────────────────
export const today = () => new Date().toISOString().split('T')[0]

export const daysSince = (dateStr) => {
  if (!dateStr) return null
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
}

export const daysUntil = (dateStr) => {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}

// ── Assessment Severity ───────────────────────────────────────────────────────
export const phqSev = (s) => {
  if (s <= 4)  return { l: 'Minimal',      c: '#1D9E75' }
  if (s <= 9)  return { l: 'Mild',         c: '#E6A817' }
  if (s <= 14) return { l: 'Moderate',     c: '#D4721A' }
  if (s <= 19) return { l: 'Mod-Severe',   c: '#C0392B' }
  return             { l: 'Severe',        c: '#922B21' }
}

export const gadSev = (s) => {
  if (s <= 4)  return { l: 'Minimal',  c: '#1D9E75' }
  if (s <= 9)  return { l: 'Mild',     c: '#E6A817' }
  if (s <= 14) return { l: 'Moderate', c: '#D4721A' }
  return             { l: 'Severe',   c: '#C0392B' }
}

// ── PSYPACT / Serviceability ──────────────────────────────────────────────────
export const getServiceability = (state, modality) => {
  if (!state) return null
  if (modality === 'in-person') {
    return LUMINA_INPERSON_STATES.has(state)
      ? { ok: true,  label: 'In-person available',                          color: C.tealGreen }
      : { ok: false, label: 'No in-person practice — consider virtual',     color: '#D4721A' }
  }
  return PSYPACT_STATES.has(state)
    ? { ok: true,  label: 'PSYPACT state — virtual eligible',               color: C.tealGreen }
    : { ok: false, label: 'Non-PSYPACT state — verify licensure',           color: '#D4721A' }
}

// ── Anonymous ID generation ───────────────────────────────────────────────────
export const genAnonId = (existingCount) =>
  `LTA-${String(existingCount + 46).padStart(4, '0')}`

// ── Token generation ──────────────────────────────────────────────────────────
export const genToken = (clientId, type) =>
  `lta_${clientId}_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

// ── Badge status colors ───────────────────────────────────────────────────────
export const BADGE_STYLES = {
  paid:       { bg: '#E6F4F1', color: '#1D6B6B', border: '#2A7F7F' },
  sent:       { bg: '#E8F0F7', color: '#1F4D78', border: '#2E74B5' },
  draft:      { bg: '#F5F0E8', color: '#666666', border: '#D5CFC4' },
  overdue:    { bg: '#FCE8E8', color: '#B03A3A', border: '#D9534F' },
  processing: { bg: '#FFF3E0', color: '#8B5E00', border: '#F0A500' },
  pending:    { bg: '#F5F0E8', color: '#666666', border: '#D5CFC4' },
  active:     { bg: '#E6F4F1', color: '#1D6B6B', border: '#2A7F7F' },
  discharged: { bg: '#F5F0E8', color: '#666666', border: '#D5CFC4' },
}

// ── Next renewal date ─────────────────────────────────────────────────────────
export const nextRenewal = (anchorMonth) => {
  if (!anchorMonth) return '—'
  const now = new Date()
  const thisYear = now.getFullYear()
  const anchor = new Date(thisYear, anchorMonth - 1, 1)
  if (anchor <= now) anchor.setFullYear(thisYear + 1)
  return anchor.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
