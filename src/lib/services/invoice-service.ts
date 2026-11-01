import { db } from '@/lib/db'
import { invoiceAmount } from '@/lib/access'
import { notifyUser, recordAudit } from '@/lib/activity'

export interface CreateInvoiceInput {
  invoiceNumber?: string
  clientId: string
  caseId?: string
  amount: number
  currency?: string
  status?: string
  dueDate: string
  paidDate?: string
  description: string
  items?: { description: string; quantity: number; unitPrice: number; total: number }[]
}

export interface UpdateInvoiceInput {
  status?: string
}

export interface InvoiceFilters {
  userId: string
  role: string
}

export async function getInvoices(filters: InvoiceFilters) {
  const { userId, role } = filters

  const where: Record<string, unknown> = {}
  if (role === 'CLIENT') where.clientId = userId
  else if (role === 'LAWYER') where.case = { lawyerId: userId }

  const invoices = await db.invoice.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      case: { select: { id: true, caseNumber: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return invoices
}

export async function createInvoice(data: CreateInvoiceInput, actorId: string) {
  const { clientId, caseId, amount, description, dueDate, items, status, invoiceNumber } = data
  const count = await db.invoice.count()
  const finalInvoiceNumber = invoiceNumber || `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`
  const total = invoiceAmount(amount, items)

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber: finalInvoiceNumber,
      clientId,
      caseId: caseId || null,
      amount: total,
      description,
      dueDate: new Date(dueDate),
      items: JSON.stringify(items || []),
      status: status || 'PENDING',
      statusChangedBy: actorId,
    },
  })

  await recordAudit({
    actorId,
    action: 'invoice.created',
    entity: 'Invoice',
    entityId: invoice.id,
    summary: `${finalInvoiceNumber} issued`,
  })
  await notifyUser(clientId, 'A new invoice is ready', `${finalInvoiceNumber} for PKR ${total}`, '/portal/invoices')

  return invoice
}

export async function updateInvoice(id: string, data: UpdateInvoiceInput, actorId: string) {
  const updateData: Record<string, unknown> = { status: data.status, statusChangedBy: actorId }
  if (data.status === 'PAID') updateData.paidDate = new Date()
  const updated = await db.invoice.update({ where: { id }, data: updateData })
  return updated
}

export async function assertInvoiceAccess(id: string, userId: string, role: string) {
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { case: { select: { lawyerId: true, clientId: true } } },
  })
  if (!invoice) return { ok: false as const, status: 404 as const }
  if (role === 'ADMIN') return { ok: true as const, status: 200 as const }
  if (role === 'CLIENT' && invoice.clientId === userId) return { ok: true as const, status: 200 as const }
  if (role === 'LAWYER' && invoice.case?.lawyerId === userId) return { ok: true as const, status: 200 as const }
  return { ok: false as const, status: 403 as const }
}
