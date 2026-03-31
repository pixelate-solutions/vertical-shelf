import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/member(.*)', '/owner(.*)', '/onboarding(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  if (isProtectedRoute(request) && !userId) {
    const signInUrl = new URL('/login', request.url)
    signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
