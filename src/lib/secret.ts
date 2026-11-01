import crypto from 'crypto'

export function authSecret() {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is required')
  }
  return 'dev-only-shaheen-law-secret'
}

export function secretKey() {
  return crypto.scryptSync(authSecret(), 'shaheen-law-field', 32)
}
