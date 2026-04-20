/**
 * Forgot Password Page
 *
 * Public route: /forgot-password
 *
 * Collects an email address and calls POST /api/v1/auth/forgot-password.
 * Always shows the same opaque confirmation on a resolved (non-validation)
 * response so the UI never reveals whether an address is registered.
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../utils/constants'
import { Inp, Btn, Note } from '../components/ui'
import api from '../utils/api'

const GENERIC_CONFIRMATION =
  'If that email is registered, a reset link has been sent. Check your inbox.'

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.auth.forgotPassword(email.trim())
      setSubmitted(true)
    } catch (err) {
      if (err?.status === 400) {
        setError(err?.message || 'Please enter a valid email address.')
      } else {
        setSubmitted(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bgPage, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, width:'100%', maxWidth:400, overflow:'hidden', boxShadow:'0 8px 32px rgba(29,107,107,0.12)' }}>

        <div style={{ background:C.tealDark, padding:'24px 28px' }}>
          <div style={{ fontSize:10, color:'#A8D5D5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Password Reset</div>
          <div style={{ fontSize:20, fontWeight:700, color:C.white }}>LUMINA</div>
          <div style={{ fontSize:11, color:'#A8D5D5', letterSpacing:'0.06em' }}>THERAPY ALLIANCE</div>
          <div style={{ fontSize:12, color:'#7ABCBC', marginTop:8 }}>Forgot your password?</div>
        </div>

        <div style={{ padding:24 }}>
          {submitted ? (
            <>
              <Note color={C.tealGreen}>{GENERIC_CONFIRMATION}</Note>
              <div style={{ fontSize:12, color:C.textMid, lineHeight:1.7, marginBottom:16 }}>
                The link will expire in 2 hours and can only be used once. If you do not receive an email within a few minutes, please check your spam folder or try again.
              </div>
              <Link to="/login" style={{ fontSize:12, color:C.teal, textDecoration:'none', fontWeight:600 }}>
                ← Back to sign in
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize:12, color:C.textMid, lineHeight:1.7, marginBottom:16 }}>
                Enter the email address associated with your Lumina account and we will send you a link to reset your password.
              </div>

              <Inp
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
              />

              {error && (
                <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:14 }}>
                  {error}
                </div>
              )}

              <Btn onClick={handleSubmit} disabled={loading || !email} style={{ width:'100%', marginTop:4 }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Btn>

              <div style={{ marginTop:16, fontSize:12 }}>
                <Link to="/login" style={{ color:C.teal, textDecoration:'none', fontWeight:600 }}>
                  ← Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
