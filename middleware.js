import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protects dashboard routes. If unauthenticated, redirect to NextAuth sign-in page and keep callbackUrl
export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // Allow static files, _next, api/auth, and public root
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/register') ||
    pathname === '/' ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const signInUrl = new URL('/api/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
