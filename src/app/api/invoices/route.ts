import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { getCurrentUser } from '@/lib/auth'
import { invoiceSchema, invoiceStatusSchema } from '@/lib/validations'
import { getInvoices, createInvoice, updateInvoice, assertInvoiceAccess } from '@/lib/services'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invoices = await getInvoices({
    userId: user.id,
    role: user.role,
  })

  return NextResponse.json({ invoices })
}

export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const result = invoiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { clientId, caseId, amount, description, dueDate, items, status, invoiceNumber } = result.data
    if (user.role === 'LAWYER') {
      if (!caseId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const matter = await db.case.findFirst({ where: { id: caseId, lawyerId: user.id, clientId } })
      if (!matter) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const invoice = await createInvoice({
      clientId,
      caseId: caseId || undefined,
      amount,
      description,
      dueDate,
      items,
      status,
      invoiceNumber,
    }, user.id)
    return NextResponse.json({ invoice })
  } catch {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
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
    const body = await request.json()
    const result = invoiceStatusSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { id, status } = result.data
    const access = await assertInvoiceAccess(id, user.id, user.role)
    if (!access.ok) {
      return NextResponse.json({ error: access.status === 404 ? 'Invoice not found' : 'Forbidden' }, { status: access.status })
    }
    const updated = await updateInvoice(id, { status }, user.id)
    return NextResponse.json({ invoice: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
