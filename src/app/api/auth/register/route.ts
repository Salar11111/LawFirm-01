import { NextRequest, NextResponse } from 'next/server'
import { createSession, sessionCookieOptions } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'
import { rateLimit, registerRateLimiter } from '@/lib/rate-limit'
import { getUserByEmail, createUser } from '@/lib/services'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, registerRateLimiter)
  if (limited) return limited
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { name, email, password, phone, cnic, city, address } = result.data
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    const user = await createUser({
      name,
      email,
      password,
      phone,
      cnic,
      city,
      address,
    })
    const token = createSession(user.id)
    const response = NextResponse.json({ user })
    response.cookies.set('session', token, sessionCookieOptions())
    return response
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
