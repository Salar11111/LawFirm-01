import { db } from '@/lib/db'
import { notifyUser } from '@/lib/activity'

export interface CreateMessageInput {
  receiverId: string
  content: string
}

export interface MessageFilters {
  userId: string
  partnerId?: string
}

export async function getMessages(filters: MessageFilters) {
  const { userId, partnerId } = filters

  const where: Record<string, unknown> = {
    OR: [{ senderId: userId }, { receiverId: userId }],
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
      where: { senderId: partnerId, receiverId: userId, read: false },
      data: { read: true },
    })
  }

  return messages
}

export async function sharesMatter(userId: string, otherUserId: string) {
  if (!otherUserId || userId === otherUserId) return false
  const shared = await db.case.findFirst({
    where: {
      OR: [
        { clientId: userId, lawyerId: otherUserId },
        { clientId: otherUserId, lawyerId: userId },
      ],
    },
    select: { id: true },
  })
  return Boolean(shared)
}

export async function createMessage(data: CreateMessageInput, senderId: string) {
  const { receiverId, content } = data

  const message = await db.message.create({
    data: { senderId, receiverId, content },
    include: {
      sender: { select: { id: true, name: true, role: true, avatar: true } },
      receiver: { select: { id: true, name: true, role: true, avatar: true } },
    },
  })

  const href = message.receiver.role === 'CLIENT' ? '/portal/messages' : '/dashboard/messages'
  await notifyUser(receiverId, `Message from ${message.sender.name}`, content.slice(0, 180), href)

  return message
}
