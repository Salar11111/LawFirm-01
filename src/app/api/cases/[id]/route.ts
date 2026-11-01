import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { verifyCsrfToken } from '@/lib/csrf'
import { getCaseById, deleteCase } from '@/lib/services'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { case: caseData, forbidden } = await getCaseById(id, user.id, user.role)

  if (!caseData) {
    if (forbidden) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  return NextResponse.json({ case: caseData })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyCsrfToken(_request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can delete cases' }, { status: 403 })
  }
  const { id } = await params
  await deleteCase(id)
  return NextResponse.json({ success: true })
}
