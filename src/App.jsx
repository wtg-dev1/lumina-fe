/**
 * Lumina Ops — Main App
 *
 * Routing:
 *   /                  → ops platform (requires auth)
 *   /login             → login page
 *   /assess/:token     → standalone client assessment form (no auth)
 *   /assess            → assessment selector (no auth, used in dev)
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { OpsStoresProvider } from './data/stores'
import OpsApp from './views/OpsApp'
import LoginPage from './views/LoginPage'
import AssessPage from './views/AssessPage'

export default function App() {
  return (
    <OpsStoresProvider>
      <Routes>
        {/* Public — no auth */}
        <Route path="/assess/:token" element={<AssessPage />} />
        <Route path="/assess"        element={<AssessPage />} />
        <Route path="/login"         element={<LoginPage />} />

        {/* Protected — ops platform */}
        <Route path="/" element={<Navigate to="/ops" replace />} />
        <Route path="/ops/*" element={<OpsApp />} />
        <Route path="*" element={<Navigate to="/ops" replace />} />
      </Routes>
    </OpsStoresProvider>
  )
}
