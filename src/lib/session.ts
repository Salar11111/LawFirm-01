import crypto from 'crypto'
import { authSecret } from '@/lib/secret'

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000

function sign(payload: string) {
  return crypto.createHmac('sha256', authSecret()).update(payload).digest('hex')
}

function signaturesMatch(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production',
  }
}

export function createSession(userId: string, issuedAt = Date.now(), sessionVersion = 0) {
  const payload = JSON.stringify({ id: userId, ts: issuedAt, v: sessionVersion })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = sign(encoded)
  return `${encoded}.${sig}`
}

export function verifySession(token: string): { id: string; ts: number; v: number } | null {
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null
  if (!signaturesMatch(sign(encoded), sig)) return null
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as { id?: unknown; ts?: unknown; v?: unknown }
    if (typeof payload.id !== 'string' || typeof payload.ts !== 'number') return null
    if (Date.now() - payload.ts > SESSION_MAX_AGE_MS) return null
    const version = typeof payload.v === 'number' ? payload.v : 0
    return { id: payload.id, ts: payload.ts, v: version }
  } catch {
    return null
  }
}
