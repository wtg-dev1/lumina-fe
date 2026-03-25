/**
 * OpsApp — Main shell for the Lumina Operations Platform
 * Handles role detection, sidebar nav, and view routing.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../utils/constants'
import { useStore } from '../data/store'

// ── View imports ──────────────────────────────────────────────────────────────
import DashboardView      from './admin/DashboardView'
import ReferralsView      from './admin/ReferralsView'
import EmployersView      from './admin/EmployersView'
import PracticesView      from './admin/PracticesView'
import ClientsView        from './admin/ClientsView'
import SessionsView       from './admin/SessionsView'
import AssessmentsView    from './admin/AssessmentsView'
import AssessmentSendView from './admin/AssessmentSendView'
import BankingView        from './admin/BankingView'
import BillingView        from './admin/BillingView'
import PayoutsView        from './admin/PayoutsView'
import ROIView            from './admin/ROIView'
import PracticePortalView from './practice/PracticePortalView'
import EmployerPortalView from './employer/EmployerPortalView'

// ── Nav ───────────────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { id:'dashboard',        l:'Dashboard' },
  { id:'referrals',        l:'Referrals ✦' },
  { id:'employers',        l:'Employers' },
  { id:'practices',        l:'Practices' },
  { id:'clients',          l:'Clients' },
  { id:'sessions',         l:'Sessions' },
  { id:'assessments',      l:'Assessments' },
  { id:'send-assessments', l:'Send Assessments' },
  { id:'banking',          l:'Banking 🔒' },
  { id:'billing',          l:'Billing' },
  { id:'payouts',          l:'Payouts' },
  { id:'roi',              l:'ROI Reports' },
]

const PRACTICE_NAV = [
  { id:'practice',              l:'My Referrals' },
  { id:'practice-clients',      l:'My Clients' },
  { id:'practice-assessments',  l:'Send Assessments' },
]

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function OpsApp() {
  const { state } = useStore()
  const navigate  = useNavigate()
  const isMobile  = useIsMobile()

  const [view,    setView]    = useState('dashboard')
  const [role,    setRole]    = useState(() => localStorage.getItem('lumina_role') || 'admin')
  const [navOpen, setNavOpen] = useState(false)

  // Role classification
  const isPractice = state.practices.some(p => p.id === role)
  const isEmployer = state.employers.some(e => e.id === role)
  const isAdmin    = !isPractice && !isEmployer

  const currentPrac = isPractice ? state.practices.find(p => p.id === role) : null
  const currentEmp  = isEmployer ? state.employers.find(e => e.id === role) : null

  const navLabel = isPractice
    ? currentPrac?.name
    : isEmployer
    ? currentEmp?.name
    : ADMIN_NAV.find(n => n.id === view)?.l

  const handleNav = (id) => { setView(id); setNavOpen(false) }

  const handleRole = (r) => {
    setRole(r)
    localStorage.setItem('lumina_role', r)
    const newIsPractice = state.practices.some(p => p.id === r)
    const newIsEmployer = state.employers.some(e => e.id === r)
    if (r === 'admin')    setView('dashboard')
    else if (newIsEmployer) setView('employer-portal')
    else                    setView('practice')
    setNavOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('lumina_role')
    localStorage.removeItem('lumina_token')
    navigate('/login')
  }

  // ── Sidebar component ──────────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{
      width: isMobile ? '100%' : 214,
      flexShrink: 0,
      background: C.tealDark,
      display: 'flex',
      flexDirection: 'column',
      ...(isMobile ? {
        position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:200,
        overflowY:'auto',
        transform: navOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.22s ease',
      } : {})
    }}>
      {/* Logo */}
      <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:C.white, letterSpacing:'0.05em' }}>LUMINA</div>
          <div style={{ fontSize:10, color:'#A8D5D5', marginTop:2, letterSpacing:'0.07em' }}>THERAPY ALLIANCE</div>
          <div style={{ marginTop:10, fontSize:9, color:'#7ABCBC', textTransform:'uppercase', letterSpacing:'0.08em', background:'rgba(255,255,255,0.08)', padding:'3px 7px', borderRadius:3, display:'inline-block' }}>
            {isPractice ? 'Practice Portal' : isEmployer ? 'Employer Portal' : 'Admin Portal'}
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setNavOpen(false)} style={{ background:'none', border:'none', color:'#A8D5D5', fontSize:22, cursor:'pointer' }}>✕</button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        {isPractice ? (
          PRACTICE_NAV.map(n => (
            <NavBtn key={n.id} label={n.l} active={view===n.id} onClick={() => handleNav(n.id)}/>
          ))
        ) : isEmployer ? (
          <NavBtn label="My Portal" active={true} onClick={() => handleNav('employer-portal')}/>
        ) : (
          ADMIN_NAV.map(n => (
            <NavBtn key={n.id} label={n.l} active={view===n.id} onClick={() => handleNav(n.id)}/>
          ))
        )}
      </nav>

      {/* Role switcher + logout */}
      <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ fontSize:9, color:'#7ABCBC', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Switch View</div>
        <select value={role} onChange={e => handleRole(e.target.value)}
          style={{ width:'100%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:4, padding:'7px 8px', fontSize:11, color:C.white, fontFamily:'Arial,sans-serif', cursor:'pointer', outline:'none' }}>
          <option value="admin">🔑 Lumina Admin</option>
          <optgroup label="── Practices ──">
            {state.practices.map(p => <option key={p.id} value={p.id}>🏥 {p.name.length>24?p.name.slice(0,24)+'…':p.name}</option>)}
          </optgroup>
          <optgroup label="── Employers ──">
            {state.employers.map(e => <option key={e.id} value={e.id}>🏢 {e.name.length>24?e.name.slice(0,24)+'…':e.name}</option>)}
          </optgroup>
        </select>
        {isPractice  && <div style={{ fontSize:10, color:'#A8D5D5', marginTop:5 }}>{currentPrac?.city}</div>}
        {isEmployer  && <div style={{ fontSize:10, color:'#A8D5D5', marginTop:5 }}>Employer Portal</div>}
        {isAdmin     && <div style={{ fontSize:10, color:'#7ABCBC', marginTop:5 }}>Daniel Selling, Psy.D.</div>}
        <button onClick={handleLogout} style={{ marginTop:8, width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:4, padding:'6px', fontSize:11, color:'#A8D5D5', cursor:'pointer', fontFamily:'Arial,sans-serif' }}>
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:isMobile?'column':'row', fontFamily:'Arial,sans-serif', background:C.bgPage }}>

      {/* Mobile overlay */}
      {isMobile && navOpen && (
        <div onClick={() => setNavOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:199 }}/>
      )}

      {/* Sidebar */}
      <Sidebar/>

      {/* Main */}
      <div style={{ flex:1, overflowY:'auto', minWidth:0 }}>
        {/* Top bar */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:isMobile?'11px 16px':'11px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', position:isMobile?'sticky':'static', top:0, zIndex:100 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {isMobile && (
              <button onClick={() => setNavOpen(true)} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:4, padding:'5px 9px', fontSize:16, cursor:'pointer', color:C.teal, lineHeight:1 }}>☰</button>
            )}
            <div style={{ fontSize:12, color:C.textMid }}>
              <span style={{ color:C.teal, fontWeight:700 }}>Lumina</span>
              <span style={{ margin:'0 6px', color:C.border }}>›</span>
              <span style={{ fontWeight:600, color:C.textDark }}>{navLabel}</span>
            </div>
          </div>
          <div style={{ fontSize:11, color:C.textMid }}>Mar 2026</div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:isMobile?'16px 12px':'26px 26px' }}>
          {/* Employer portal */}
          {isEmployer && <EmployerPortalView employerId={role}/>}

          {/* Practice portal */}
          {isPractice && view==='practice'             && <PracticePortalView    practiceId={role}/>}
          {isPractice && view==='practice-clients'     && <ClientsView           practiceId={role}/>}
          {isPractice && view==='practice-assessments' && <AssessmentSendView    practiceId={role}/>}

          {/* Admin views */}
          {isAdmin && view==='dashboard'        && <DashboardView      setView={setView}/>}
          {isAdmin && view==='referrals'        && <ReferralsView      />}
          {isAdmin && view==='employers'        && <EmployersView      />}
          {isAdmin && view==='practices'        && <PracticesView      />}
          {isAdmin && view==='clients'          && <ClientsView        />}
          {isAdmin && view==='sessions'         && <SessionsView       />}
          {isAdmin && view==='assessments'      && <AssessmentsView    />}
          {isAdmin && view==='send-assessments' && <AssessmentSendView />}
          {isAdmin && view==='banking'          && <BankingView        />}
          {isAdmin && view==='billing'          && <BillingView        />}
          {isAdmin && view==='payouts'          && <PayoutsView        />}
          {isAdmin && view==='roi'              && <ROIView            />}
        </div>
      </div>
    </div>
  )
}

// ── Nav Button ────────────────────────────────────────────────────────────────
function NavBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', display:'flex', alignItems:'center', padding:'10px 12px', borderRadius:4, marginBottom:1,
      fontSize:13, fontWeight:active?700:400, color:active?C.white:'#A8D5D5',
      background:active?'rgba(255,255,255,0.15)':'transparent',
      border:active?'1px solid rgba(255,255,255,0.2)':'1px solid transparent',
      cursor:'pointer', textAlign:'left', fontFamily:'Arial,sans-serif',
    }}>{label}</button>
  )
}
