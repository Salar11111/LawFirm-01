import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { sendMail } from '@/lib/mail'
import { db } from '@/lib/db'
import { authRateLimiter, rateLimit } from '@/lib/rate-limit'
import { getUserByEmail } from '@/lib/services'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, authRateLimiter, 'forgot')
  if (limited) return limited
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
  const response: { ok: true; devResetUrl?: string } = { ok: true }
  if (!email) return NextResponse.json(response)

  const user = await getUserByEmail(email)
  if (!user || !user.active) return NextResponse.json(response)

  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await db.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt } })

  const origin = request.nextUrl.origin
  const resetUrl = `${origin}/?reset=${encodeURIComponent(token)}`
  const mailed = await sendMail(
    user.email,
    'Reset your Shaheen Law Associates password',
    `Use this link within one hour to choose a new password:\n${resetUrl}`,
  )
  if (!mailed.delivered && process.env.NODE_ENV !== 'production') {
    response.devResetUrl = resetUrl
  }
  return NextResponse.json(response)
}
