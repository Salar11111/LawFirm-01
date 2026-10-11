import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET || 'shaheen-law-associates-secret-2024'

function sign(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

export function createSession(userId: string) {
  const payload = JSON.stringify({ id: userId, ts: Date.now() })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = sign(encoded)
  return `${encoded}.${sig}`
}

export function verifySession(token: string): { id: string; ts: number } | null {
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null
  if (sign(encoded) !== sig) return null
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
    return payload
  } catch {
    return null
  }
}

export type SafeUser = Omit<
  ReturnType<typeof Object> & {
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
  },
  'password'
>

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  const payload = verifySession(token)
  if (!payload) return null
  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user || !user.active) return null
  const { password: _password, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/session=([^;]+)/)
  if (!match) return null
  const payload = verifySession(match[1])
  if (!payload) return null
  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user || !user.active) return null
  const { password: _password, ...userWithoutPassword } = user
  return userWithoutPassword
}
