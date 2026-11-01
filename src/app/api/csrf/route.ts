import { NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/csrf'

export const runtime = 'nodejs'

export async function GET() {
  const token = generateCsrfToken()
  const response = NextResponse.json({ token })
  response.cookies.set('csrf-token', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
    path: '/',
  })
  return response
}
