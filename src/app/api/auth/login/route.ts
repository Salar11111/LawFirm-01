import { NextRequest, NextResponse } from 'next/server'
import { createSession, sessionCookieOptions } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'
import { loginSchema } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'
import { loginRateLimiter, rateLimit } from '@/lib/rate-limit'
import { getUserByEmail } from '@/lib/services'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, loginRateLimiter)
  if (limited) return limited
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { email, password } = result.data
    const user = await getUserByEmail(email)
    if (!user || !user.active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const token = createSession(user.id)
    const { password: _pw, ...safeUser } = user
    const response = NextResponse.json({ user: safeUser })
    response.cookies.set('session', token, sessionCookieOptions())
    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
