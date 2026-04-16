import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes (but not /api/auth itself)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/auth')) {
    // The admin page itself is a client component that handles its own auth
    // API routes do their own cookie check
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/episodes/:path*'],
}
