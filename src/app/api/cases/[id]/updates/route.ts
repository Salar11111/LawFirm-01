import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { verifyCsrfToken } from '@/lib/csrf'
import { caseUpdateCreateSchema } from '@/lib/validations'
import { assertCaseAccess } from '@/lib/services'

export const runtime = 'nodejs'

// POST a new case update (timeline entry)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { id } = await params
  const access = await assertCaseAccess(id, user.id, user.role)
  if (!access.ok) {
    return NextResponse.json({ error: access.status === 404 ? 'Case not found' : 'Forbidden' }, { status: access.status })
  }
  try {
    const body = await request.json()
    const result = caseUpdateCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { title, description, updateType } = result.data

    const update = await db.caseUpdate.create({
      data: {
        caseId: id,
        title,
        description: description || '',
        updateType: updateType || 'NOTE',
        createdBy: user.id,
      },
    })
    return NextResponse.json({ update })
  } catch {
    return NextResponse.json({ error: 'Failed to add update' }, { status: 500 })
  }
}