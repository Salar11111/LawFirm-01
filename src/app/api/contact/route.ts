import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { verifyCsrfToken } from '@/lib/csrf'
import { contactStatusSchema } from '@/lib/validations'
import { getContacts, createContact, updateContact } from '@/lib/services'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const messages = await getContacts()
  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  }
  try {
    const { name, email, phone, subject, message } = await request.json()
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Please fill all required fields' }, { status: 400 })
    }
    const contact = await createContact({ name, email, phone, subject, message })
    return NextResponse.json({ contact })
  } catch {
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const parsed = contactStatusSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { id, status } = parsed.data
    const updated = await updateContact(id, status, user.id)
    return NextResponse.json({ contact: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
