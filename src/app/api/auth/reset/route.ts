import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { authRateLimiter, rateLimit } from '@/lib/rate-limit'
import { resetPasswordSchema } from '@/lib/validations'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, authRateLimiter, 'reset')
  if (limited) return limited
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const tokenHash = crypto.createHash('sha256').update(parsed.data.token).digest('hex')
  const reset = await db.passwordReset.findUnique({ where: { tokenHash } })
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: 'This reset link is invalid or expired' }, { status: 400 })
  }

  const password = await hashPassword(parsed.data.password)
  await db.$transaction([
    db.user.update({
      where: { id: reset.userId },
      data: { password, sessionVersion: { increment: 1 } },
    }),
    db.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ])

  return NextResponse.json({ ok: true })
}
