/**
 * Lumina Ops — Main App
 *
 * Routing:
 *   /                         → ops platform (requires auth)
 *   /login                    → login page
 *   /assessments/:token       → standalone client assessment form (no auth)
 *   /assess/:token            → legacy alias, redirects to /assessments/:token
 *   /assess                   → assessment selector (no auth, used in dev)
 */

import React from 'react'
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { OpsStoresProvider } from './data/stores'
import OpsApp from './views/OpsApp'
import LoginPage from './views/LoginPage'
import ForgotPasswordPage from './views/ForgotPasswordPage'
import ResetPasswordPage from './views/ResetPasswordPage'
import AssessPage from './views/AssessPage'

function LegacyAssessRedirect() {
  const { token } = useParams()
  const { search } = useLocation()
  return <Navigate to={`/assessments/${token}${search || ''}`} replace />
}

export default function App() {
  return (
    <OpsStoresProvider>
      <Routes>
        {/* Public — no auth */}
        <Route path="/assessments/:token" element={<AssessPage />} />
        <Route path="/assess/:token"      element={<LegacyAssessRedirect />} />
        <Route path="/assess"             element={<AssessPage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/forgot-password"    element={<ForgotPasswordPage />} />
        <Route path="/reset-password"     element={<ResetPasswordPage />} />

        {/* Protected — ops platform */}
        <Route path="/" element={<Navigate to="/ops" replace />} />
        <Route path="/ops/*" element={<OpsApp />} />
        <Route path="*" element={<Navigate to="/ops" replace />} />
      </Routes>
    </OpsStoresProvider>
  )
}
