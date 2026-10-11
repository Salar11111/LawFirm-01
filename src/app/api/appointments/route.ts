import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (user.role === 'CLIENT') {
    where.clientId = user.id
  } else if (user.role === 'LAWYER') {
    where.lawyerId = user.id
  }
  if (status && status !== 'ALL') where.status = status

  const appointments = await db.appointment.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      lawyer: { select: { id: true, name: true, specialization: true, avatar: true } },
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })

  return NextResponse.json({ appointments })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subject, lawyerId, date, time, duration, type, notes, clientId } = await request.json()
    if (!subject || !lawyerId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Clients book for themselves; lawyers/admins can book for specified clients
    const finalClientId = user.role === 'CLIENT' ? user.id : clientId
    if (!finalClientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 })
    }

    const appointment = await db.appointment.create({
      data: {
        subject,
        clientId: finalClientId,
        lawyerId,
        date: new Date(date),
        time,
        duration: duration || 60,
        type: type || 'CONSULTATION',
        status: 'SCHEDULED',
        notes: notes || null,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lawyer: { select: { id: true, name: true, specialization: true } },
      },
    })
    return NextResponse.json({ appointment })
  } catch {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { id, status } = await request.json()
    const updated = await db.appointment.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json({ appointment: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
