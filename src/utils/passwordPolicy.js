/**
 * Lumina Password Policy
 *
 * Mirrors the server-side policy enforced by the Go backend on
 * POST /api/v1/auth/reset-password. Used on the client to give
 * inline, real-time feedback and to avoid unnecessary round trips.
 */

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 12 characters',                      test: (p) => p.length >= 12 },
  { id: 'upper',  label: 'Contains an uppercase letter (A-Z)',          test: (p) => /[A-Z]/.test(p) },
  { id: 'digit',  label: 'Contains a digit (0-9)',                      test: (p) => /[0-9]/.test(p) },
  { id: 'symbol', label: 'Contains a special character (e.g. ! ? @ #)', test: (p) => /[!-/:-@[-`{-~]/.test(p) },
]

export const evaluatePassword = (p) =>
  PASSWORD_RULES.map((r) => ({ id: r.id, label: r.label, passed: r.test(p || '') }))

export const isPasswordValid = (p) =>
  PASSWORD_RULES.every((r) => r.test(p || ''))
