import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('studio_token')?.value

  if (token) {
    try {
      await jwtVerify(token, secret)
      // Valid session — send them straight to dashboard
      return NextResponse.redirect(new URL('/studio/dashboard', req.url))
    } catch {
      // Invalid/expired token — let them see the login page
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/studio/login'],
}
