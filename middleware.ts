import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = req.nextUrl.pathname === "/signin"

  // Skip middleware for auth routes
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // If not authenticated and trying to access protected route
  if (!req.auth) {
    // For API routes, return JSON response
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }
    // For other routes, redirect to signin
    if (!isPublicRoute) {
      const newUrl = new URL("/signin", req.nextUrl.origin)
      return Response.redirect(newUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Protect all routes including API routes, except NextAuth routes
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
}