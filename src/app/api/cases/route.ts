import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { caseCreateSchema, caseUpdateSchema } from '@/lib/validations'
import { getCases, createCase, updateCase, assertCaseAccess } from '@/lib/services'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const cases = await getCases({
    userId: user.id,
    role: user.role,
    status: status || undefined,
    search: search || undefined,
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
    const result = caseCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { title, description, practiceArea, court, status, priority, filedDate, nextHearing, clientId, lawyerId } = result.data

    const newCase = await createCase({
      title,
      description,
      practiceArea,
      court,
      status,
      priority,
      filedDate,
      nextHearing,
      clientId,
      lawyerId,
    }, user.id, user.role)

    return NextResponse.json({ case: newCase })
  } catch {
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
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'Case ID required' }, { status: 400 })

    const result = caseUpdateSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const access = await assertCaseAccess(id, user.id, user.role)
    if (!access.ok) return NextResponse.json({ error: access.status === 404 ? 'Case not found' : 'Forbidden' }, { status: access.status })
    if (user.role === 'LAWYER' && result.data.lawyerId && result.data.lawyerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await updateCase(id, result.data)
    return NextResponse.json({ case: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}
