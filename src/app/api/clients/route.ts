import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

// GET clients (admin/lawyer only) — list all clients with case counts
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  const where: Record<string, unknown> = { role: 'CLIENT' }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ]
  }

  const clients = await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cnic: true,
      city: true,
      address: true,
      createdAt: true,
      active: true,
      _count: { select: { clientCases: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ clients })
}

// PATCH toggle active status
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }
  try {
    const { id, active } = await request.json()
    const updated = await db.user.update({
      where: { id },
      data: { active },
    })
    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
