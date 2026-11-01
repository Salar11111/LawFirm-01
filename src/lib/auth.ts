import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifySession } from '@/lib/session'

export { createSession, sessionCookieOptions, verifySession } from '@/lib/session'

export type SafeUser = {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  cnic: string | null
  address: string | null
  city: string | null
  avatar: string | null
  bio: string | null
  specialization: string | null
  experience: number | null
  barLicense: string | null
  active: boolean
}

async function userFromToken(token: string | undefined) {
  if (!token) return null
  const payload = verifySession(token)
  if (!payload) return null
  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user || !user.active) return null
  const { password: _password, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  return userFromToken(cookieStore.get('session')?.value)
}

export async function getSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
  return userFromToken(match?.[1])
}
