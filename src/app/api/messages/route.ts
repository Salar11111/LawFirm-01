import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { messageSchema } from '@/lib/validations'
import { verifyCsrfToken } from '@/lib/csrf'
import { getMessages, createMessage, sharesMatter } from '@/lib/services'

export const runtime = 'nodejs'

// GET messages for current user (both directions)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const partnerId = searchParams.get('partnerId')

  const messages = await getMessages({
    userId: user.id,
    partnerId: partnerId || undefined,
  })

  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  }
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = messageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
    }
    const { receiverId, content } = result.data
    const allowed = await sharesMatter(user.id, receiverId)
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const message = await createMessage({ receiverId, content }, user.id)
    return NextResponse.json({ message })
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
