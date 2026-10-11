import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('caseId')

  const where: Record<string, unknown> = {}
  if (user.role === 'CLIENT') {
    // Clients only see documents attached to their cases
    where.case = { clientId: user.id }
  }
  if (caseId) where.caseId = caseId

  const documents = await db.document.findMany({
    where,
    include: {
      uploader: { select: { id: true, name: true } },
      case: { select: { id: true, caseNumber: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ documents })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  try {
    const { title, type, fileName, fileSize, fileUrl, description, caseId } = await request.json()
    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }
    const document = await db.document.create({
      data: {
        title,
        type,
        fileName: fileName || title,
        fileSize: fileSize || 0,
        fileUrl: fileUrl || `/documents/${fileName || title}`,
        description: description || null,
        caseId: caseId || null,
        uploadedBy: user.id,
      },
    })
    return NextResponse.json({ document })
  } catch {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.document.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
