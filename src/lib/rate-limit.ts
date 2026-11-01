import { NextRequest, NextResponse } from 'next/server'

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

export function rateLimit(request: NextRequest, limiter: RateLimiter): NextResponse | null {
  const { success, retryAfter } = limiter.check(getClientIp(request))
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    })
  }
  return null
}

export const loginRateLimiter = createRateLimiter(5, 60_000)
export const registerRateLimiter = createRateLimiter(3, 60_000)
export const authRateLimiter = createRateLimiter(30, 60_000)