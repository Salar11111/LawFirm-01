import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where: Record<string, unknown> = {}
  if (user.role === 'CLIENT') where.clientId = user.id

  const invoices = await db.invoice.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      case: { select: { id: true, caseNumber: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ invoices })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { clientId, caseId, amount, description, dueDate, items, status } = await request.json()
    if (!clientId || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const count = await db.invoice.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        caseId: caseId || null,
        amount: parseFloat(amount),
        description,
        dueDate: new Date(dueDate),
        items: JSON.stringify(items || []),
        status: status || 'PENDING',
      },
    })
    return NextResponse.json({ invoice })
  } catch {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { id, status } = await request.json()
    const updateData: Record<string, unknown> = { status }
    if (status === 'PAID') updateData.paidDate = new Date()
    const updated = await db.invoice.update({ where: { id }, data: updateData })
    return NextResponse.json({ invoice: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
