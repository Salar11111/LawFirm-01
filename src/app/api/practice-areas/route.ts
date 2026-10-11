import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const areas = await db.practiceArea.findMany({ orderBy: { title: 'asc' } })
  return NextResponse.json({ areas })
}
