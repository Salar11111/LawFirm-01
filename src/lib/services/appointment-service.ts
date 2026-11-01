import { db } from '@/lib/db'
import { notifyUser, recordAudit } from '@/lib/activity'

export interface CreateAppointmentInput {
  subject: string
  clientId: string
  lawyerId: string
  date: string
  time: string
  duration?: number
  type?: string
  status?: string
  notes?: string
}

export interface UpdateAppointmentInput {
  status?: string
}

export interface AppointmentFilters {
  userId: string
  role: string
  status?: string
}

export async function getAppointment(filters: AppointmentFilters) {
  const { userId, role, status } = filters

  const where: Record<string, unknown> = {}
  if (role === 'CLIENT') {
    where.clientId = userId
  } else if (role === 'LAWYER') {
    where.lawyerId = userId
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

  return appointments
}

export async function getAppointmentById(id: string, userId: string, role: string) {
  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      lawyer: { select: { id: true, name: true, specialization: true, avatar: true } },
    },
  })

  if (!appointment) {
    return { appointment: null, forbidden: false }
  }

  if (
    (role === 'CLIENT' && appointment.clientId !== userId) ||
    (role === 'LAWYER' && appointment.lawyerId !== userId)
  ) {
    return { appointment: null, forbidden: true }
  }

  return { appointment, forbidden: false }
}

export async function createAppointment(data: CreateAppointmentInput, userId: string, userRole: string) {
  const { subject, lawyerId, date, time, duration, type, notes, clientId } = data

  const finalClientId = userRole === 'CLIENT' ? userId : clientId
  if (!finalClientId) {
    throw new Error('Client is required')
  }

  const lawyer = await db.user.findFirst({
    where: { id: lawyerId, role: { in: ['LAWYER', 'ADMIN'] }, active: true },
    select: { id: true },
  })
  if (!lawyer) throw new Error('Choose an active lawyer')

  if (userRole !== 'CLIENT') {
    const client = await db.user.findFirst({
      where: { id: finalClientId, role: 'CLIENT', active: true },
      select: { id: true },
    })
    if (!client) throw new Error('Client is required')
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

  await recordAudit({
    actorId: userId,
    action: 'appointment.created',
    entity: 'Appointment',
    entityId: appointment.id,
    summary: `${subject} booked with ${appointment.lawyer.name}`,
  })
  await notifyUser(
    finalClientId,
    'Consultation booked',
    `${subject} on ${date} at ${time}`,
    '/portal/appointments',
  )

  return appointment
}

export async function updateAppointment(id: string, data: UpdateAppointmentInput) {
  const updated = await db.appointment.update({
    where: { id },
    data: { status: data.status },
  })

  return updated
}

export async function deleteAppointment(id: string) {
  await db.appointment.delete({ where: { id } })
}
