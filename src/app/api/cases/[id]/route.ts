import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
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

  if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  // Clients can only view their own case
  if (user.role === 'CLIENT' && caseData.clientId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ case: caseData })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can delete cases' }, { status: 403 })
  }
  const { id } = await params
  await db.case.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
