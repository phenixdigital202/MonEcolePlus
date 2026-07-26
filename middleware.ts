import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get authentication and role cookies
  const userId = request.cookies.get("user_id")?.value
  const userRole = request.cookies.get("user_role")?.value

  // If path is dashboard and user not authenticated, redirect to login
  if (pathname.startsWith("/dashboard")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Role verification to prevent crossing dashboards
    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (pathname.startsWith("/dashboard/parent") && userRole !== "parent" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Student dashboard sub-level routes check (if role matches)
    if (pathname.startsWith("/dashboard/grades") && !["student", "teacher", "admin"].includes(userRole || "")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

// Config to specify matching routes
export const config = {
  matcher: ["/dashboard/:path*"]
}
