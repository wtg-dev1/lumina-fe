/**
 * Lumina Ops — Main App
 *
 * Routing:
 *   /                  → ops platform (requires auth)
 *   /login             → login page
 *   /assess/:token     → standalone client assessment form (no auth)
 *   /assess            → assessment selector (no auth, used in dev)
 */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './data/store'
import { C } from './utils/constants'
import OpsApp from './views/OpsApp'
import LoginPage from './views/LoginPage'
import AssessPage from './views/AssessPage'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        {/* Public — no auth */}
        <Route path="/assess/:token" element={<AssessPage />} />
        <Route path="/assess"        element={<AssessPage />} />
        <Route path="/login"         element={<LoginPage />} />

        {/* Protected — ops platform */}
        <Route path="/*" element={<OpsApp />} />
      </Routes>
    </StoreProvider>
  )
}
