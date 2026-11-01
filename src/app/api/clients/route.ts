import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUsers, updateUser } from '@/lib/services'

export const runtime = 'nodejs'

// GET clients (admin/lawyer only) — list all clients with case counts
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'LAWYER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  const clients = await getUsers({ role: 'CLIENT' })

  let filtered = clients
  if (search) {
    const s = search.toLowerCase()
    filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.phone && c.phone.toLowerCase().includes(s))
    )
  }

  return NextResponse.json({ clients: filtered })
}

// PATCH toggle active status
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }
  try {
    const { id, active } = await request.json()
    const updated = await updateUser(id, { active })
    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
