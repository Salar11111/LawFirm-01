import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getCurrentUser } from '@/lib/auth'
import { documentSchema } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'
import { canReadDocument } from '@/lib/access'
import { recordAudit } from '@/lib/activity'
import { assertCaseAccess, getDocuments, createDocument, deleteDocument } from '@/lib/services'
import { db } from '@/lib/db'
import {
  MAX_UPLOAD_BYTES,
  contentTypeFor,
  isAllowedUpload,
  matchesDeclaredType,
  removeUpload,
  safeStoredName,
  saveUpload,
  storedFileUrl,
} from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('caseId')

  const documents = await getDocuments({
    userId: user.id,
    role: user.role,
    caseId: caseId || undefined,
  })

  return NextResponse.json({ documents })
}

async function assertUploadCase(caseId: string | undefined, userId: string, role: string) {
  if (!caseId) return null
  const access = await assertCaseAccess(caseId, userId, role)
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 404 ? 'Case not found' : 'Forbidden' },
      { status: access.status },
    )
  }
  return null
}

export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    return uploadFile(request, user.id, user.role)
  }

  try {
    const body = await request.json()
    const result = documentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const denied = await assertUploadCase(result.data.caseId, user.id, user.role)
    if (denied) return denied
    const { title, type, fileName, fileSize, fileUrl, description, caseId } = result.data
    const document = await createDocument({
      title,
      type,
      fileName,
      fileSize,
      fileUrl,
      description,
      caseId,
      uploadedBy: user.id,
    })
    await recordAudit({
      actorId: user.id,
      action: 'document.created',
      entity: 'Document',
      entityId: document.id,
      summary: `${document.title} added`,
    })
    return NextResponse.json({ document })
  } catch {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

async function uploadFile(request: NextRequest, userId: string, role: string) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    const title = String(form.get('title') || '')
    const type = String(form.get('type') || '')
    const description = String(form.get('description') || '')
    const caseId = String(form.get('caseId') || '')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required' }, { status: 400 })
    }
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File must be between 1 byte and 10 MB' }, { status: 400 })
    }
    if (!isAllowedUpload(file.name)) {
      return NextResponse.json({ error: 'File type is not allowed' }, { status: 400 })
    }
    const parsed = documentSchema.safeParse({
      title,
      type,
      description: description || undefined,
      caseId: caseId || undefined,
      fileName: file.name,
      fileSize: file.size,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const denied = await assertUploadCase(parsed.data.caseId, userId, role)
    if (denied) return denied

    const id = randomUUID()
    const storedName = safeStoredName(id, file.name)
    const bytes = Buffer.from(await file.arrayBuffer())
    if (!matchesDeclaredType(file.name, bytes)) {
      return NextResponse.json({ error: 'File contents do not match its type' }, { status: 400 })
    }
    await saveUpload(storedName, bytes)
    const document = await db.document.create({
      data: {
        id,
        title: parsed.data.title,
        type: parsed.data.type,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: storedFileUrl(storedName),
        description: parsed.data.description || null,
        caseId: parsed.data.caseId || null,
        uploadedBy: userId,
      },
    })
    await recordAudit({
      actorId: userId,
      action: 'document.uploaded',
      entity: 'Document',
      entityId: document.id,
      summary: `${document.title} uploaded`,
    })
    return NextResponse.json({ document })
  } catch {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const existing = await db.document.findUnique({
    where: { id },
    include: { case: { select: { clientId: true, lawyerId: true } } },
  })
  if (!existing) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  if (!canReadDocument(user.role, user.id, existing)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await removeUpload(existing.fileUrl)
  await deleteDocument(id)
  return NextResponse.json({ success: true })
}
