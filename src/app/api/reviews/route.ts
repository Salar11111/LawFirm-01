import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const reviews = await db.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ reviews })
}
