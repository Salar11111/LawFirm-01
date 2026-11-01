import { NextRequest, NextResponse } from 'next/server'
import { sessionCookieOptions } from '@/lib/auth'
import { verifyCsrfToken } from '@/lib/csrf'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set('session', '', sessionCookieOptions(0))
  return response
}
