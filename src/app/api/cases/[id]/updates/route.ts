import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

// POST a new case update (timeline entry)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { id } = await params
  try {
    const { title, description, updateType } = await request.json()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

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
