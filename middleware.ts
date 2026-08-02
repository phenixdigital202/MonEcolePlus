import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ── Security Headers ─────────────────────────────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block")
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY")
  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  // Permissions policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )
  return response
}

// ── Role-Based Access Control Map ────────────────────────────────────────────
const ROLE_ACCESS: Record<string, string[]> = {
  "/dashboard/admin":           ["admin"],
  "/dashboard/parent":          ["parent", "admin"],
  "/dashboard/grades":          ["student", "teacher", "admin", "parent"],
  "/dashboard/absences":        ["student", "teacher", "admin", "parent"],
  "/dashboard/classes":         ["teacher", "admin"],
  "/dashboard/schedule":        ["student", "teacher", "admin"],
  "/dashboard/messages":        ["student", "teacher", "admin", "parent"],
  "/dashboard/bibliotheque":    ["student", "teacher", "admin", "parent"],
  "/dashboard/documents":       ["student", "admin"],
  "/dashboard/performance":     ["student", "admin"],
  "/dashboard/analytics":       ["admin"],
  "/dashboard/ai-insights":     ["teacher", "admin"],
  "/dashboard/achievements":    ["student", "admin"],
  "/dashboard/settings":        ["admin", "teacher", "student", "parent"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get authentication and role cookies
  const userId = request.cookies.get("user_id")?.value
  const userRole = request.cookies.get("user_role")?.value

  // ── API Routes: Require authentication ─────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    if (!userId) {
      return addSecurityHeaders(
        NextResponse.json({ error: "Non autorisé" }, { status: 401 })
      )
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── Super Admin Route Protection ───────────────────────────────────────────
  if (pathname.startsWith("/super-admin")) {
    if (!userId) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }
    if (userRole !== "super_admin") {
      // 403 Forbidden redirect to school dashboard
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/dashboard", request.url))
      )
    }
  }

  // ── Dashboard Routes ───────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    // Redirect unauthenticated users
    if (!userId) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }

    // Auto-redirect super_admin to their dedicated dashboard
    if (userRole === "super_admin") {
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/super-admin", request.url))
      )
    }

    // Role-based access control
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ACCESS)) {
      if (pathname.startsWith(routePrefix)) {
        if (!allowedRoles.includes(userRole || "")) {
          return addSecurityHeaders(
            NextResponse.redirect(new URL("/dashboard", request.url))
          )
        }
        break
      }
    }
  }

  return addSecurityHeaders(NextResponse.next())
}

// Config to specify matching routes
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/super-admin/:path*"]
}
