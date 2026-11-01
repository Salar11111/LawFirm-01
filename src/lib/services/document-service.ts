import { db } from '@/lib/db'

export interface CreateDocumentInput {
  title: string
  type: string
  fileName?: string
  fileSize?: number
  fileUrl?: string
  description?: string
  caseId?: string
  uploadedBy: string
}

export interface DocumentFilters {
  userId: string
  role: string
  caseId?: string
}

export async function getDocuments(filters: DocumentFilters) {
  const { userId, role, caseId } = filters

  const where: Record<string, unknown> = {}
  if (role === 'CLIENT') {
    where.case = { clientId: userId }
  } else if (role === 'LAWYER') {
    where.OR = [
      { case: { lawyerId: userId } },
      { caseId: null, uploadedBy: userId },
    ]
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

  return documents
}

export async function createDocument(data: CreateDocumentInput) {
  const { title, type, fileName, fileSize, fileUrl, description, caseId, uploadedBy } = data

  const document = await db.document.create({
    data: {
      title,
      type,
      fileName: fileName || title,
      fileSize: fileSize || 0,
      fileUrl: fileUrl || '/documents/' + (fileName || title),
      description: description || null,
      caseId: caseId || null,
      uploadedBy,
    },
  })

  return document
}

export async function deleteDocument(id: string) {
  await db.document.delete({ where: { id } })
}
