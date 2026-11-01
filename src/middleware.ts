import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

// Session verification reads the database via Prisma, which is unavailable on
// the Edge runtime, so the middleware must run on the Node.js runtime.
export const runtime = 'nodejs'

export const config = {
  matcher: ['/portal', '/portal/:path*', '/dashboard', '/dashboard/:path*', '/api/:path*'],
}

const PUBLIC_GET = new Set([
  '/api/practice-areas',
  '/api/team',
  '/api/reviews',
  '/api/stats',
  '/api/csrf',
])

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()

  if (pathname.startsWith('/api/')) {
    if (isPublicApi(pathname, method)) return NextResponse.next()
    const user = await getSessionFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  const user = await getSessionFromRequest(request)
  if (!user) {
    const url = new URL('/', request.url)
    url.searchParams.set('login', 'true')
    return NextResponse.redirect(url)
  }

  if (pathname === '/portal' || pathname.startsWith('/portal/')) {
    if (user.role !== 'CLIENT') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (user.role !== 'ADMIN' && user.role !== 'LAWYER') {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  return NextResponse.next()
}

function isPublicApi(pathname: string, method: string) {
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) return true
  if (method === 'GET' && PUBLIC_GET.has(pathname)) return true
  if (pathname === '/api/contact' && method === 'POST') return true
  return false
}
