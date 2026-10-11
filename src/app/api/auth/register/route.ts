import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, cnic, city, address } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    const hashed = await hashPassword(password)
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashed,
        role: 'CLIENT',
        phone: phone || null,
        cnic: cnic || null,
        city: city || null,
        address: address || null,
      },
    })
    const token = createSession(user.id)
    const { password: _pw, ...safeUser } = user
    const response = NextResponse.json({ user: safeUser })
    response.cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
