/**
 * Lumina Ops — Global State Store
 *
 * Uses React Context + useReducer for state management.
 * When Go backend is connected, replace dispatch calls with API calls
 * and use the response to update state.
 *
 * Storage: persists to localStorage (key: lumina_ops_v12)
 * In production: remove localStorage and fetch everything from the API on mount.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { seed } from '../resources/seed'
import { today, genAnonId, genToken } from '../utils/helpers'

const STORE_KEY = 'lumina_ops_v12'

// ── Load / Save ────────────────────────────────────────────────────────────────
const load = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const save = (state) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)) } catch {}
}

// ── Reducer ────────────────────────────────────────────────────────────────────
function reducer(state, action) {
  const { type, payload } = action

  switch (type) {

    // Employers
    case 'ADD_EMPLOYER':
      return { ...state, employers: [...state.employers, { id:`e${Date.now()}`, ...payload, active:true }] }
    case 'UPDATE_EMPLOYER':
      return { ...state, employers: state.employers.map(e => e.id===payload.id ? { ...e, ...payload } : e) }

    // Practices
    case 'ADD_PRACTICE':
      return { ...state, practices: [...state.practices, { id:`p${Date.now()}`, ...payload, active:true, rateIndividual:20000, rateCouple:30000, ratePsychiatry:35000, banking:null }] }
    case 'UPDATE_PRACTICE':
      return { ...state, practices: state.practices.map(p => p.id===payload.id ? { ...p, ...payload } : p) }

    // Contracts
    case 'ADD_CONTRACT':
      return { ...state, contracts: [...state.contracts, { id:`c${Date.now()}`, ...payload, active:true }] }

    // Clinicians
    case 'ADD_CLINICIAN':
      return { ...state, clinicians: [...state.clinicians, { id:`cl${Date.now()}`, ...payload }] }

    // Clients
    case 'ADD_CLIENT': {
      const anonId = genAnonId(state.clients.length)
      return { ...state, clients: [...state.clients, { id:`cl_${Date.now()}`, anonId, ...payload, intakeDate:today(), status:'active' }] }
    }
    case 'UPDATE_CLIENT':
      return { ...state, clients: state.clients.map(c => c.id===payload.id ? { ...c, ...payload } : c) }
    case 'SET_CLIENT_NAME':
      return { ...state, clients: state.clients.map(c => c.anonId===payload.anonId ? { ...c, clientName:payload.clientName } : c) }

    // Referrals
    case 'ADD_REFERRAL': {
      const anonId = genAnonId(state.clients.length + state.referrals.length)
      const ref = { id:`ref${Date.now()}`, anonId, ...payload.referral, status:'pending', createdAt:today(), scheduledAt:'', practiceConfirmedAt:'', practiceContactedAt:'', practiceSessionBookedAt:'' }
      const client = { id:`cl_${Date.now()}`, anonId, employerId:payload.referral.employerId, practiceId:payload.practiceId, clinicianId:payload.clinicianId, intakeDate:today(), status:'active', modality:payload.referral.modality, state:payload.referral.state, email:payload.referral.clientEmail, phone:payload.referral.clientPhone, clientName:'' }
      return { ...state, referrals:[...state.referrals, ref], clients:[...state.clients, client] }
    }
    case 'UPDATE_REFERRAL':
      return { ...state, referrals: state.referrals.map(r => r.id===payload.id ? { ...r, ...payload } : r) }
    case 'CONFIRM_REFERRAL':
      return {
        ...state,
        referrals: state.referrals.map(r => r.id===payload.refId ? { ...r, practiceConfirmedAt:today() } : r),
        clients:   state.clients.map(c => c.anonId===payload.anonId ? { ...c, clientName:payload.clientName } : c),
      }
    case 'REFERRAL_CONTACTED':
      return { ...state, referrals: state.referrals.map(r => r.id===payload.id ? { ...r, practiceContactedAt:today() } : r) }
    case 'REFERRAL_BOOKED':
      return { ...state, referrals: state.referrals.map(r => r.id===payload.id ? { ...r, practiceSessionBookedAt:today(), status:'scheduled' } : r) }

    // Sessions
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, { id:`s${Date.now()}`, ...payload }] }

    // Assessments — send link (creates pending record)
    // payload.token is optional — if provided by the component, use it directly
    case 'SEND_ASSESSMENT': {
      const token = payload.token || genToken(payload.clientId, payload.type)
      const record = { id:`a_${Date.now()}`, clientId:payload.clientId, type:payload.type, date:today(), sentAt:today(), score:null, answers:null, completed:false, token }
      return { ...state, assessments:[...state.assessments, record], _lastToken: token }
    }
    // Complete assessment (in-person or via token)
    case 'COMPLETE_ASSESSMENT': {
      const pending = state.assessments.find(a => a.clientId===payload.clientId && a.type===payload.type && !a.completed)
      if (pending) {
        return { ...state, assessments: state.assessments.map(a => a.id===pending.id ? { ...a, score:payload.score, answers:payload.answers, completed:true, date:today() } : a) }
      }
      return { ...state, assessments: [...state.assessments, { id:`a_${Date.now()}`, clientId:payload.clientId, type:payload.type, date:today(), score:payload.score, answers:payload.answers, completed:true, token:null }] }
    }

    // Invoices
    case 'UPDATE_INVOICE_STATUS':
      return { ...state, invoices: state.invoices.map(i => i.id===payload.id ? { ...i, status:payload.status } : i) }

    // Admin fees
    case 'ADD_ADMIN_FEE':
      return { ...state, adminFees: [...(state.adminFees||[]), { id:`af${Date.now()}`, ...payload, status:'draft', paidDate:'' }] }
    case 'UPDATE_ADMIN_FEE':
      return { ...state, adminFees: (state.adminFees||[]).map(f => f.id===payload.id ? { ...f, ...payload, ...(payload.status==='paid'?{ paidDate:today() }:{}) } : f) }

    // Payouts
    case 'UPDATE_PAYOUT':
      return { ...state, payouts: state.payouts.map(p => p.id===payload.id ? { ...p, ...payload } : p) }

    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => load() || seed)

  // Persist on every change
  useEffect(() => { save(state) }, [state])

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
