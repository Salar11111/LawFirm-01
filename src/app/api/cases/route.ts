import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

// GET cases — clients see only their own; lawyers/admins see all (optionally filtered)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}

  if (user.role === 'CLIENT') {
    where.clientId = user.id
  }
  if (status && status !== 'ALL') {
    where.status = status
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { caseNumber: { contains: search } },
      { court: { contains: search } },
    ]
  }

  const cases = await db.case.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, city: true } },
      lawyer: { select: { id: true, name: true, specialization: true, avatar: true } },
      _count: { select: { documents: true, updates: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ cases })
}

// POST a new case (admin/lawyer only)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const { title, description, practiceArea, court, status, priority, filedDate, nextHearing, clientId, lawyerId } = body

    if (!title || !clientId || !lawyerId || !practiceArea) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate case number: SLA-YYYY-NNN
    const year = new Date().getFullYear()
    const count = await db.case.count()
    const caseNumber = `SLA-${year}-${String(count + 1).padStart(3, '0')}`

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

    // Create initial case update
    await db.caseUpdate.create({
      data: {
        caseId: newCase.id,
        title: 'Case Filed',
        description: `Case ${caseNumber} filed and assigned to the legal team.`,
        updateType: 'FILING',
        createdBy: user.id,
      },
    })

    return NextResponse.json({ case: newCase })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}

// PATCH (update) a case
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ error: 'Case ID required' }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    const allowed = ['title', 'description', 'practiceArea', 'court', 'status', 'priority', 'nextHearing', 'lawyerId', 'filedDate']
    for (const key of allowed) {
      if (data[key] !== undefined) {
        if (key === 'nextHearing' || key === 'filedDate') {
          updateData[key] = data[key] ? new Date(data[key]) : null
        } else {
          updateData[key] = data[key]
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
    return NextResponse.json({ case: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}
