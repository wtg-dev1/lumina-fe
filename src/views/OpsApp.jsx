/**
 * OpsApp — Main shell for the Lumina Operations Platform
 * Handles role detection, sidebar nav, and view routing.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { C } from '../utils/constants'
import {
  useAuthStore,
  useOrgStore,
  useUiShellStore,
} from '../data/stores'

// ── View imports ──────────────────────────────────────────────────────────────
import DashboardView      from './admin/DashboardView'
import ReferralsView      from './admin/ReferralsView'
import EmployersView      from './admin/EmployersView'
import PracticesView      from './admin/PracticesView'
import UsersView          from './admin/UsersView'
import ClientsView        from './admin/ClientsView'
import SessionsView       from './admin/SessionsView'
import AssessmentsView    from './admin/AssessmentsView'
import AssessmentSendView from './admin/AssessmentSendView'
import InPersonAssessmentView from './admin/InPersonAssessmentView'
import BankingView        from './admin/BankingView'
import BillingView        from './admin/BillingView'
import PayoutsView        from './admin/PayoutsView'
import ROIView            from './admin/ROIView'
import PracticePortalView from './practice/PracticePortalView'
import PracticeCliniciansView from './practice/PracticeCliniciansView'
import PracticeSessionsView from './practice/PracticeSessionsView'
import EmployerPortalView from './employer/EmployerPortalView'

// ── Nav ───────────────────────────────────────────────────────────────────────
const ADMIN_USERS_PATH = '/ops/admin/users'

const ADMIN_NAV = [
  { id:'dashboard',        l:'Dashboard',        path:'/ops/admin/dashboard' },
  { id:'referrals',        l:'Referrals ✦',      path:'/ops/admin/referrals' },
  { id:'employers',        l:'Employers',        path:'/ops/admin/employers' },
  { id:'practices',        l:'Practices',        path:'/ops/admin/practices' },
  { id:'clients',          l:'Clients',          path:'/ops/admin/clients' },
  { id:'sessions',         l:'Sessions',         path:'/ops/admin/sessions' },
  { id:'assessments',      l:'Assessments',      path:'/ops/admin/assessments' },
  { id:'send-assessments', l:'Send Assessments', path:'/ops/admin/send-assessments' },
  { id:'banking',          l:'Banking 🔒',       path:'/ops/admin/banking' },
  { id:'billing',          l:'Billing',          path:'/ops/admin/billing' },
  { id:'payouts',          l:'Payouts',          path:'/ops/admin/payouts' },
  { id:'roi',              l:'ROI Reports',      path:'/ops/admin/roi' },
]

const PRACTICE_NAV = [
  { id:'practice',              l:'My Referrals',      path:'/ops/practice/portal' },
  { id:'practice-clinicians',   l:'My Clinicians',     path:'/ops/practice/clinicians' },
  { id:'practice-sessions',     l:'My Sessions',       path:'/ops/practice/sessions' },
  { id:'practice-clients',      l:'My Clients',        path:'/ops/practice/clients' },
  { id:'practice-assessments',  l:'Send Assessments',  path:'/ops/practice/assessments' },
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
  const { isAuthenticated, logout } = useAuthStore()
  const { employers, practices, summaryLoaded, ensureSummaryLoaded } = useOrgStore()
  const { role, navOpen, setNavOpen, switchRole } = useUiShellStore()
  const navigate  = useNavigate()
  const location = useLocation()
  const isMobile  = useIsMobile()
  const safeEmployers = Array.isArray(employers) ? employers : []
  const safePractices = Array.isArray(practices) ? practices : []

  const roleKind = useMemo(() => {
    if (role === 'admin') return 'admin'
    if (safeEmployers.some((e) => e.id === role)) return 'employer'
    if (safePractices.some((p) => p.id === role)) return 'practice'
    if (location.pathname.startsWith('/ops/employer')) return 'employer'
    if (location.pathname.startsWith('/ops/practice')) return 'practice'
    return 'practice'
  }, [role, safeEmployers, safePractices, location.pathname])
  const isAdmin = roleKind === 'admin'
  const isPractice = roleKind === 'practice'
  const isEmployer = roleKind === 'employer'

  const currentPrac = isPractice ? safePractices.find(p => p.id === role) : null
  const currentEmp  = isEmployer ? safeEmployers.find(e => e.id === role) : null

  const currentAdminNav =
    location.pathname === ADMIN_USERS_PATH
      ? { l: 'Users' }
      : ADMIN_NAV.find((n) => location.pathname === n.path)
  const currentPracticeNav = PRACTICE_NAV.find((n) => location.pathname === n.path)
  const navLabel = isPractice
    ? currentPrac?.name
    : isEmployer
    ? currentEmp?.name
    : currentAdminNav?.l

  const handleNav = (path) => {
    navigate(path)
    setNavOpen(false)
  }

  const handleRole = (r) => {
    switchRole(r)
    const newIsPractice = safePractices.some(p => p.id === r)
    const newIsEmployer = safeEmployers.some(e => e.id === r)
    if (r === 'admin') navigate('/ops/admin/dashboard')
    else if (newIsEmployer) navigate('/ops/employer/portal')
    else if (newIsPractice) navigate('/ops/practice/portal')
    else navigate('/ops')
    setNavOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    ensureSummaryLoaded()
  }, [ensureSummaryLoaded])

  useEffect(() => {
    if (!location.pathname.startsWith('/ops')) return
    if (location.pathname !== '/ops') return
    if (role === 'admin') {
      navigate('/ops/admin/dashboard', { replace: true })
      return
    }
    if (!summaryLoaded) return
    if (safeEmployers.some((e) => e.id === role)) {
      navigate('/ops/employer/portal', { replace: true })
      return
    }
    if (safePractices.some((p) => p.id === role) || role !== 'admin') {
      navigate('/ops/practice/portal', { replace: true })
    }
  }, [location.pathname, role, summaryLoaded, safeEmployers, safePractices, navigate])

  if (!isAuthenticated) return <Navigate to="/login" replace />

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
            <NavBtn key={n.id} label={n.l} active={location.pathname===n.path} onClick={() => handleNav(n.path)}/>
          ))
        ) : isEmployer ? (
          <NavBtn label="My Portal" active={location.pathname==='/ops/employer/portal'} onClick={() => handleNav('/ops/employer/portal')}/>
        ) : (
          ADMIN_NAV.map(n => (
            <NavBtn key={n.id} label={n.l} active={location.pathname===n.path} onClick={() => handleNav(n.path)}/>
          ))
        )}
      </nav>

      {isAdmin && (
        <div style={{ padding:'10px 8px 12px', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
          <NavBtn
            label="Users"
            active={location.pathname === ADMIN_USERS_PATH}
            onClick={() => handleNav(ADMIN_USERS_PATH)}
          />
        </div>
      )}

      {/* Role switcher + logout */}
      <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ fontSize:9, color:'#7ABCBC', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Switch View</div>
        <select value={role} onChange={e => handleRole(e.target.value)}
          style={{ width:'100%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:4, padding:'7px 8px', fontSize:11, color:C.white, fontFamily:'Arial,sans-serif', cursor:'pointer', outline:'none' }}>
          <option value="admin">🔑 Lumina Admin</option>
          <optgroup label="── Practices ──">
            {safePractices.map(p => <option key={p.id} value={p.id}>🏥 {p.name.length>24?p.name.slice(0,24)+'…':p.name}</option>)}
          </optgroup>
          <optgroup label="── Employers ──">
            {safeEmployers.map(e => <option key={e.id} value={e.id}>🏢 {e.name.length>24?e.name.slice(0,24)+'…':e.name}</option>)}
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
              <span style={{ fontWeight:600, color:C.textDark }}>{navLabel || currentPracticeNav?.l || 'Portal'}</span>
            </div>
          </div>
          <div style={{ fontSize:11, color:C.textMid }}>Mar 2026</div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:isMobile?'16px 12px':'26px 26px' }}>
          <Routes>
            <Route path="/" element={<Navigate to={role === 'admin' ? '/ops/admin/dashboard' : '/ops/practice/portal'} replace />} />

            <Route path="/admin/dashboard" element={isAdmin ? <DashboardView onNavigate={navigate} /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/referrals" element={isAdmin ? <ReferralsView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/employers" element={isAdmin ? <EmployersView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/practices" element={isAdmin ? <PracticesView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/users" element={isAdmin ? <UsersView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/clients" element={isAdmin ? <ClientsView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/sessions" element={isAdmin ? <SessionsView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/assessments" element={isAdmin ? <AssessmentsView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/send-assessments" element={isAdmin ? <AssessmentSendView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/assessments/in-person/:id" element={isAdmin ? <InPersonAssessmentView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/banking" element={isAdmin ? <BankingView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/billing" element={isAdmin ? <BillingView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/payouts" element={isAdmin ? <PayoutsView /> : <Navigate to="/ops" replace />} />
            <Route path="/admin/roi" element={isAdmin ? <ROIView /> : <Navigate to="/ops" replace />} />

            <Route path="/practice/portal" element={isPractice ? <PracticePortalView practiceId={role} /> : <Navigate to="/ops" replace />} />
            <Route path="/practice/clinicians" element={isPractice ? <PracticeCliniciansView practiceId={role} /> : <Navigate to="/ops" replace />} />
            <Route path="/practice/sessions" element={isPractice ? <PracticeSessionsView practiceId={role} /> : <Navigate to="/ops" replace />} />
            <Route path="/practice/clients" element={isPractice ? <ClientsView practiceId={role} /> : <Navigate to="/ops" replace />} />
            <Route path="/practice/assessments" element={isPractice ? <AssessmentSendView practiceId={role} /> : <Navigate to="/ops" replace />} />
            <Route path="/practice/assessments/in-person/:id" element={isPractice ? <InPersonAssessmentView practiceId={role} /> : <Navigate to="/ops" replace />} />

            <Route path="/employer/portal" element={isEmployer ? <EmployerPortalView employerId={role} /> : <Navigate to="/ops" replace />} />
            <Route path="*" element={<Navigate to="/ops" replace />} />
          </Routes>
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
