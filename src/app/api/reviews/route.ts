import { NextResponse } from 'next/server'
import { getReviews } from '@/lib/services'

export const runtime = 'nodejs'

export async function GET() {
  const reviews = await getReviews()
  return NextResponse.json({ reviews })
}
