import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/auth/session"
import { canAccessRoute } from "@/lib/utils/permissions"
import type { UserRole } from "@/lib/db/models"

const publicRoutes = ["/login", "/register"]

const protectedRoutes = [
  "/dashboard",
  "/pos",
  "/products",
  "/inventory",
  "/suppliers",
  "/customers",
  "/employees",
  "/reports",
  "/settings",
  "/audit-logs",
]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip internal assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  const session = request.cookies.get("session")?.value
  const payload = session ? await decrypt(session) : null

  // Root route — public
  if (pathname === "/") {
    if (!payload) return NextResponse.next()

    const redirectPath =
      payload.role === "cashier" ? "/pos" : "/dashboard"

    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // Auth pages
  if (isPublicRoute && payload) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protected routes
  if (isProtectedRoute && !payload) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access
  if (isProtectedRoute && payload) {
    const basePath = "/" + pathname.split("/")[1]

    if (!canAccessRoute(payload.role as UserRole, basePath)) {
      const redirectPath =
        payload.role === "cashier" ? "/pos" : "/dashboard"

      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
