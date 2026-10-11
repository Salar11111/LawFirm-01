import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

// GET messages for current user (both directions)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const partnerId = searchParams.get('partnerId')

  const where: Record<string, unknown> = {
    OR: [{ senderId: user.id }, { receiverId: user.id }],
  }
  if (partnerId) {
    where.AND = [{ OR: [{ senderId: partnerId }, { receiverId: partnerId }] }]
  }

  const messages = await db.message.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, role: true, avatar: true } },
      receiver: { select: { id: true, name: true, role: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark received messages as read
  if (partnerId) {
    await db.message.updateMany({
      where: { senderId: partnerId, receiverId: user.id, read: false },
      data: { read: true },
    })
  }

  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { receiverId, content } = await request.json()
    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver and content are required' }, { status: 400 })
    }
    const message = await db.message.create({
      data: { senderId: user.id, receiverId, content },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } },
        receiver: { select: { id: true, name: true, role: true, avatar: true } },
      },
    })
    return NextResponse.json({ message })
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
