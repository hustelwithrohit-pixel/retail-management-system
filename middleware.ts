import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isOwner = token?.role === 'OWNER'
    const path = req.nextUrl.pathname

    // Protect owner-only routes
    if (
      (path.startsWith('/staff') || path.startsWith('/settings')) &&
      !isOwner
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/:path*',
    '/billing/:path*',
    '/invoices/:path*',
    '/customers/:path*',
    '/reports/:path*',
    '/marketing/:path*',
    '/reminders/:path*',
    '/staff/:path*',
    '/settings/:path*',
  ],
}

