import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, sessionCookieOptions } from '@/lib/auth'
import { verifyCsrfToken } from '@/lib/csrf'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getSessionFromRequest(request)
  if (user) {
    await db.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } })
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set('session', '', sessionCookieOptions(0))
  return response
}
