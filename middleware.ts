import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/api/auth']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  const userId = req.cookies.get('userId')?.value
  if (!userId) {
    const signIn = new URL('/sign-in', req.url)
    return NextResponse.redirect(signIn)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
