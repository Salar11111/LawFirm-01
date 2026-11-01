import { db } from '@/lib/db'
import { sendMail } from '@/lib/mail'

export async function recordAudit(event: {
  actorId?: string | null
  action: string
  entity: string
  entityId?: string | null
  summary: string
}) {
  try {
    await db.auditEvent.create({
      data: {
        actorId: event.actorId || null,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId || null,
        summary: event.summary,
      },
    })
  } catch (error) {
    console.error('Audit log failed', error)
  }
}

export async function notifyUser(userId: string, title: string, body: string, href?: string) {
  try {
    await db.notice.create({
      data: { userId, title, body, href: href || null },
    })
  } catch (error) {
    console.error('Notice failed', error)
    return
  }
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })
  if (!user?.email) return
  try {
    await sendMail(user.email, title, body)
  } catch (error) {
    console.error('Notice email failed', error)
  }
}
