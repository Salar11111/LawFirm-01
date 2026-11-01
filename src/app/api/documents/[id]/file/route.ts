import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { canReadDocument } from '@/lib/access'
import { db } from '@/lib/db'
import { contentTypeFor, readUpload, storedNameFromUrl } from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const document = await db.document.findUnique({
    where: { id },
    include: { case: { select: { clientId: true, lawyerId: true } } },
  })
  if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  if (!canReadDocument(user.role, user.id, document)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const storedName = storedNameFromUrl(document.fileUrl)
  if (!storedName) return NextResponse.json({ error: 'File is not stored' }, { status: 404 })

  try {
    const bytes = await readUpload(storedName)
    const filename = document.fileName.replace(/[\r\n"]/g, '')
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentTypeFor(document.fileName),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(bytes.length),
      },
    })
  } catch {
    return NextResponse.json({ error: 'File is not stored' }, { status: 404 })
  }
}
