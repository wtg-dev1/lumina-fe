/**
 * Login Page
 *
 * In production: POST to /api/v1/auth/login with email + password.
 * On success: store JWT, redirect to / with role from JWT claims.
 *
 * Demo credentials (replace with real auth):
 *   admin@luminatherapyalliance.com  / any password → admin
 *   admin@wtgtherapy.com             / any password → practice p1
 *   admin@therapygroupdc.com         / any password → practice p7
 *   schen@meridiancap.com            / any password → employer e1
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../utils/constants'
import { Inp, Btn } from '../components/ui'
import api, { setToken } from '../utils/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.auth.login(email, password)
      const token = res?.token || res?.jwt || res?.data?.token
      const role = res?.role || res?.userRole || res?.data?.role

      if (!token || !role) throw new Error('Login response missing token or role.')

      setToken(token)
      localStorage.setItem('lumina_role', role)
      navigate('/ops')
    } catch (err) {
      setError(err?.message || 'Login failed. Check credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bgPage, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, width:'100%', maxWidth:400, overflow:'hidden', boxShadow:'0 8px 32px rgba(29,107,107,0.12)' }}>

        <div style={{ background:C.tealDark, padding:'24px 28px' }}>
          <div style={{ fontSize:10, color:'#A8D5D5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Welcome to</div>
          <div style={{ fontSize:20, fontWeight:700, color:C.white }}>LUMINA</div>
          <div style={{ fontSize:11, color:'#A8D5D5', letterSpacing:'0.06em' }}>THERAPY ALLIANCE</div>
          <div style={{ fontSize:12, color:'#7ABCBC', marginTop:8 }}>Operations Platform</div>
        </div>

        <form onSubmit={handleLogin} style={{ padding:24 }}>
          <Inp label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email"/>
          <Inp label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"/>

          {error && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:14 }}>
              {error}
            </div>
          )}

          <Btn onClick={handleLogin} disabled={loading || !email || !password} style={{ width:'100%', marginTop:4 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Btn>

          <div style={{ marginTop:16, fontSize:11, color:C.textMid, lineHeight:1.7 }}>
            Sign in with your Lumina account credentials.
          </div>
        </form>
      </div>
    </div>
  )
}
