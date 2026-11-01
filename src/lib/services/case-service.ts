import { db } from '@/lib/db'
import { canAccessMatter } from '@/lib/access'
import { notifyUser, recordAudit } from '@/lib/activity'
import { decryptField } from '@/lib/field-crypto'

export interface CreateCaseInput {
  title: string
  description?: string
  practiceArea: string
  court?: string
  status?: string
  priority?: string
  filedDate?: string
  nextHearing?: string
  clientId: string
  lawyerId: string
}

export interface UpdateCaseInput {
  title?: string
  description?: string
  practiceArea?: string
  court?: string
  status?: string
  priority?: string
  nextHearing?: string
  lawyerId?: string
  filedDate?: string
}

export interface CaseFilters {
  userId: string
  role: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
}

export async function getCases(filters: CaseFilters) {
  const { userId, role, status, search, page, pageSize } = filters

  const where: Record<string, unknown> = {}

  if (role === 'CLIENT') {
    where.clientId = userId
  } else if (role === 'LAWYER') {
    where.lawyerId = userId
  }
  if (status && status !== 'ALL') {
    where.status = status
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { caseNumber: { contains: search } },
      { court: { contains: search } },
      { practiceArea: { contains: search } },
    ]
  }

  const paged = page && pageSize
  const [cases, total] = await Promise.all([
    db.case.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, phone: true, city: true } },
        lawyer: { select: { id: true, name: true, specialization: true, avatar: true } },
        _count: { select: { documents: true, updates: true } },
      },
      orderBy: { updatedAt: 'desc' },
      ...(paged ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
    }),
    db.case.count({ where }),
  ])

  return { cases, total, page: paged ? page : 1, pageSize: paged ? pageSize : total }
}

export async function getCaseById(id: string, userId: string, role: string) {
  const caseData = await db.case.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, cnic: true, address: true, city: true } },
      lawyer: { select: { id: true, name: true, email: true, phone: true, specialization: true, avatar: true, barLicense: true } },
      updates: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' }, include: { uploader: { select: { name: true } } } },
      invoices: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!caseData) {
    return { case: null, forbidden: false }
  }

  if (!canAccessMatter(role, userId, caseData)) {
    return { case: null, forbidden: true }
  }

  if (caseData.client) caseData.client.cnic = decryptField(caseData.client.cnic)
  return { case: caseData, forbidden: false }
}

export async function assertCaseAccess(id: string, userId: string, role: string) {
  const caseRow = await db.case.findUnique({
    where: { id },
    select: { id: true, clientId: true, lawyerId: true },
  })
  if (!caseRow) return { ok: false as const, status: 404 as const }
  if (!canAccessMatter(role, userId, caseRow)) return { ok: false as const, status: 403 as const }
  return { ok: true as const, status: 200 as const, caseRow }
}

export async function createCase(data: CreateCaseInput, userId: string, role = 'ADMIN') {
  const { title, description, practiceArea, court, status, priority, filedDate, nextHearing, clientId } = data
  const lawyerId = role === 'LAWYER' ? userId : data.lawyerId

  const year = new Date().getFullYear()
  const count = await db.case.count()
  const caseNumber = 'SLA-' + year + '-' + String(count + 1).padStart(3, '0')

  const newCase = await db.case.create({
    data: {
      caseNumber,
      title,
      description: description || '',
      practiceArea,
      court: court || '',
      status: status || 'PENDING',
      priority: priority || 'MEDIUM',
      filedDate: filedDate ? new Date(filedDate) : new Date(),
      nextHearing: nextHearing ? new Date(nextHearing) : null,
      clientId,
      lawyerId,
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      lawyer: { select: { id: true, name: true, specialization: true } },
    },
  })

  await db.caseUpdate.create({
    data: {
      caseId: newCase.id,
      title: 'Case Filed',
      description: 'Case ' + caseNumber + ' filed and assigned to the legal team.',
      updateType: 'FILING',
      createdBy: userId,
    },
  })

  await recordAudit({
    actorId: userId,
    action: 'case.created',
    entity: 'Case',
    entityId: newCase.id,
    summary: `${caseNumber} opened for ${newCase.client.name}`,
  })
  await notifyUser(clientId, 'A new matter was opened', `${caseNumber}: ${title}`, '/portal/cases')

  return newCase
}

export async function updateCase(id: string, data: UpdateCaseInput) {
  const updateData: Record<string, unknown> = {}
  const allowed = ['title', 'description', 'practiceArea', 'court', 'status', 'priority', 'nextHearing', 'lawyerId', 'filedDate']
  for (const key of allowed) {
    const value = data[key as keyof typeof data]
    if (value !== undefined) {
      if (key === 'nextHearing' || key === 'filedDate') {
        updateData[key] = value ? new Date(value) : null
      } else {
        updateData[key] = value
      }
    }
  }
  if (data.status === 'CLOSED' || data.status === 'WON' || data.status === 'LOST') {
    updateData.closedDate = new Date()
  }

  const updated = await db.case.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      lawyer: { select: { id: true, name: true, specialization: true } },
    },
  })

  return updated
}

export async function deleteCase(id: string) {
  await db.case.delete({ where: { id } })
}
