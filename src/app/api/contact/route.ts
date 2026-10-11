import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const messages = await db.contact.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Please fill all required fields' }, { status: 400 })
    }
    const contact = await db.contact.create({
      data: {
        name,
        email,
        phone: phone || '',
        subject,
        message,
        status: 'NEW',
        handledBy: (await getCurrentUser())?.id || null,
      },
    })
    return NextResponse.json({ contact })
  } catch {
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { id, status } = await request.json()
    const updated = await db.contact.update({
      where: { id },
      data: { status, handledBy: user.id },
    })
    return NextResponse.json({ contact: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
