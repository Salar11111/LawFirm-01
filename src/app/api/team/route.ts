import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const team = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'LAWYER'] }, active: true },
    orderBy: [{ role: 'desc' }, { experience: 'desc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      bio: true,
      specialization: true,
      experience: true,
      barLicense: true,
      city: true,
      avatar: true,
    },
  })
  return NextResponse.json({ team })
}
