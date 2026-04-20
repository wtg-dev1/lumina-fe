/**
 * Reset Password Page
 *
 * Public route: /reset-password?token=<plaintext-token>
 *
 * Reads the single-use reset token from the query string, collects a new
 * password (with live policy feedback), and calls POST /api/v1/auth/reset-password.
 * On success, any existing session is cleared and the user is redirected to
 * /login via history.replace so the token query param does not linger.
 */

import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { C } from '../utils/constants'
import { Inp, Btn, Note } from '../components/ui'
import api, { clearToken } from '../utils/api'
import { evaluatePassword, isPasswordValid } from '../utils/passwordPolicy'

const INVALID_TOKEN_MESSAGE = 'Invalid or expired token'
const POLICY_MESSAGE        = 'Password does not meet the required policy'

function PolicyChecklist({ password }) {
  const rules = evaluatePassword(password)
  return (
    <ul style={{ listStyle:'none', padding:0, margin:'0 0 14px 0' }}>
      {rules.map((r) => (
        <li
          key={r.id}
          style={{
            display:'flex',
            alignItems:'center',
            fontSize:12,
            color: r.passed ? C.tealGreen : C.textMid,
            marginBottom:4,
            lineHeight:1.5,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display:'inline-block',
              width:14,
              textAlign:'center',
              marginRight:8,
              fontWeight:700,
            }}
          >
            {r.passed ? '✓' : '•'}
          </span>
          {r.label}
        </li>
      ))}
    </ul>
  )
}

function Shell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bgPage, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'0 8px 32px rgba(29,107,107,0.12)' }}>
        <div style={{ background:C.tealDark, padding:'24px 28px' }}>
          <div style={{ fontSize:10, color:'#A8D5D5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{title}</div>
          <div style={{ fontSize:20, fontWeight:700, color:C.white }}>LUMINA</div>
          <div style={{ fontSize:11, color:'#A8D5D5', letterSpacing:'0.06em' }}>THERAPY ALLIANCE</div>
          {subtitle && <div style={{ fontSize:12, color:'#7ABCBC', marginTop:8 }}>{subtitle}</div>}
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const token             = searchParams.get('token') || ''

  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [invalidLink, setInvalidLink]         = useState(false)
  const [success, setSuccess]                 = useState(false)

  const policyOk = useMemo(() => isPasswordValid(newPassword), [newPassword])
  const matches  = newPassword.length > 0 && newPassword === confirmPassword
  const canSubmit = policyOk && matches && !loading

  if (!token) {
    return (
      <Shell title="Password Reset" subtitle="Invalid reset link">
        <Note color="#D9534F">
          This reset link is missing or malformed. Please request a new one.
        </Note>
        <Link to="/forgot-password" style={{ fontSize:13, color:C.teal, textDecoration:'none', fontWeight:600 }}>
          Request a new reset link →
        </Link>
      </Shell>
    )
  }

  if (invalidLink) {
    return (
      <Shell title="Password Reset" subtitle="Link expired">
        <Note color="#D9534F">
          This reset link is invalid or has expired. Reset links are valid for 2 hours and may only be used once.
        </Note>
        <Link to="/forgot-password" style={{ fontSize:13, color:C.teal, textDecoration:'none', fontWeight:600 }}>
          Request a new reset link →
        </Link>
      </Shell>
    )
  }

  if (success) {
    return (
      <Shell title="Password Reset" subtitle="Success">
        <Note color={C.tealGreen}>
          Password reset successfully. Redirecting you to sign in…
        </Note>
      </Shell>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!policyOk) {
      setError('Please choose a password that meets all the requirements below.')
      return
    }
    if (!matches) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.auth.resetPassword(token, newPassword)
      clearToken()
      try {
        window.dispatchEvent(new CustomEvent('lumina:logout'))
      } catch { /* no-op */ }
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      const msg = err?.message || ''
      if (err?.status === 400 && msg.toLowerCase().includes(INVALID_TOKEN_MESSAGE.toLowerCase())) {
        setInvalidLink(true)
      } else if (err?.status === 400 && msg.toLowerCase().includes(POLICY_MESSAGE.toLowerCase())) {
        setError('Your password does not meet the required policy. Please review the requirements below.')
      } else if (err?.status === 400) {
        setError(msg || 'Please double-check the form and try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell title="Password Reset" subtitle="Set a new password">
      <form onSubmit={handleSubmit}>
        <div style={{ fontSize:12, color:C.textMid, lineHeight:1.7, marginBottom:16 }}>
          Choose a new password for your Lumina account. Make sure it meets all the requirements below.
        </div>

        <Inp
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••••••"
          autoComplete="new-password"
          required
        />

        <PolicyChecklist password={newPassword} />

        <Inp
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          autoComplete="new-password"
          required
        />

        {confirmPassword.length > 0 && !matches && (
          <div style={{ fontSize:12, color:'#B03A3A', marginBottom:10, marginTop:-6 }}>
            Passwords do not match.
          </div>
        )}

        {error && (
          <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:14 }}>
            {error}
          </div>
        )}

        <Btn onClick={handleSubmit} disabled={!canSubmit} style={{ width:'100%', marginTop:4 }}>
          {loading ? 'Resetting…' : 'Reset password'}
        </Btn>

        <div style={{ marginTop:16, fontSize:12 }}>
          <Link to="/login" style={{ color:C.teal, textDecoration:'none', fontWeight:600 }}>
            ← Back to sign in
          </Link>
        </div>
      </form>
    </Shell>
  )
}
