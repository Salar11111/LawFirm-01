import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { verifyCsrfToken } from '@/lib/csrf'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const notices = await db.notice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ notices })
}

export async function PATCH(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (body?.all === true) {
    await db.notice.updateMany({ where: { userId: user.id, read: false }, data: { read: true } })
    return NextResponse.json({ ok: true })
  }
  if (typeof body?.id !== 'string') {
    return NextResponse.json({ error: 'Notice ID required' }, { status: 400 })
  }
  const notice = await db.notice.findFirst({ where: { id: body.id, userId: user.id } })
  if (!notice) return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
  await db.notice.update({ where: { id: notice.id }, data: { read: true } })
  return NextResponse.json({ ok: true })
}
