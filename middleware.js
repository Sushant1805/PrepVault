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

  // Previously we redirected unauthenticated users to the NextAuth sign-in page here.
  // We'll no longer redirect for /dashboard so the client can show a modal-based auth UX.
  // This middleware will still run for the configured matcher but will not enforce a redirect.

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
