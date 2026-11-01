import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { appointmentSchema } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'
import { APPOINTMENT_STATUSES } from '@/lib/enums'
import { z } from 'zod'
import { getAppointment, getAppointmentById, createAppointment, updateAppointment } from '@/lib/services'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const appointments = await getAppointment({
    userId: user.id,
    role: user.role,
    status: status || undefined,
  })

  return NextResponse.json({ appointments })
}

export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = appointmentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { subject, lawyerId, date, time, duration, type, notes, clientId } = result.data

    const appointment = await createAppointment({
      subject,
      lawyerId,
      date,
      time,
      duration,
      type,
      notes,
      clientId: clientId ?? '',
    }, user.id, user.role)

    return NextResponse.json({ appointment })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create appointment'
    const known = message === 'Client is required' || message === 'Choose an active lawyer'
    return NextResponse.json({ error: known ? message : 'Failed to create appointment' }, { status: known ? 400 : 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const result = z.object({ id: z.string().min(1), status: z.enum(APPOINTMENT_STATUSES) }).safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { id, status } = result.data
    const existing = await getAppointmentById(id, user.id, user.role)
    if (!existing.appointment) {
      return NextResponse.json({ error: existing.forbidden ? 'Forbidden' : 'Appointment not found' }, { status: existing.forbidden ? 403 : 404 })
    }
    const updated = await updateAppointment(id, { status })
    return NextResponse.json({ appointment: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
