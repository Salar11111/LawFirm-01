import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitStore {
  get(key: string): RateLimitEntry | undefined
  set(key: string, entry: RateLimitEntry): void
  delete(key: string): void
  entries(): IterableIterator<[string, RateLimitEntry]>
}

class MemoryStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>()

  get(key: string) {
    return this.store.get(key)
  }

  set(key: string, entry: RateLimitEntry) {
    this.store.set(key, entry)
  }

  delete(key: string) {
    this.store.delete(key)
  }

  *entries() {
    yield* this.store.entries()
  }
}

export interface RateLimitResult {
  success: boolean
  retryAfter: number
}

export class RateLimiter {
  private store: RateLimitStore
  private lastPrune = Date.now()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number = 60_000,
    store?: RateLimitStore,
  ) {
    this.store = store ?? new MemoryStore()
  }

  check(key: string): RateLimitResult {
    const now = Date.now()
    this.pruneIfNeeded(now)

    const entry = this.store.get(key)
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return { success: true, retryAfter: 0 }
    }

    if (entry.count >= this.limit) {
      return { success: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
    }

    entry.count += 1
    this.store.set(key, entry)
    return { success: true, retryAfter: 0 }
  }

  snapshot() {
    return { limit: this.limit, windowMs: this.windowMs }
  }

  private pruneIfNeeded(now: number) {
    if (now - this.lastPrune < this.windowMs) return
    this.lastPrune = now
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) this.store.delete(key)
    }
  }
}

export function createRateLimiter(limit: number, windowMs = 60_000) {
  return new RateLimiter(limit, windowMs)
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

async function consumeBucket(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date()
  const existing = await db.rateLimitBucket.findUnique({ where: { key } })
  if (!existing || existing.resetAt <= now) {
    const resetAt = new Date(Date.now() + windowMs)
    await db.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    })
    return { success: true, retryAfter: 0 }
  }
  if (existing.count >= limit) {
    return { success: false, retryAfter: Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000) }
  }
  await db.rateLimitBucket.update({ where: { key }, data: { count: { increment: 1 } } })
  return { success: true, retryAfter: 0 }
}

export async function rateLimit(request: NextRequest, limiter: RateLimiter, name: string): Promise<NextResponse | null> {
  const { limit, windowMs } = limiter.snapshot()
  const key = `${name}:${getClientIp(request)}`
  let result: RateLimitResult
  try {
    result = await consumeBucket(key, limit, windowMs)
  } catch {
    result = limiter.check(key)
  }
  if (!result.success) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(result.retryAfter) },
    })
  }
  return null
}

export const loginRateLimiter = createRateLimiter(5, 60_000)
export const registerRateLimiter = createRateLimiter(3, 60_000)
export const authRateLimiter = createRateLimiter(30, 60_000)
export const contactRateLimiter = createRateLimiter(5, 60_000)