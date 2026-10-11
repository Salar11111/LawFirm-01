import { NextResponse } from 'next/server'
import { getFirmStats } from '@/lib/helpers'

export const runtime = 'nodejs'

export async function GET() {
  const stats = await getFirmStats()
  return NextResponse.json({ stats })
}
