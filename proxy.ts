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

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  const session = request.cookies.get("session")?.value
  const payload = session ? await decrypt(session) : null

  // Redirect to dashboard if logged in and accessing public route
  if (isPublicRoute && payload) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect to login if not logged in and accessing protected route
  if (isProtectedRoute && !payload) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Check role-based access
  if (isProtectedRoute && payload) {
    const basePath = "/" + path.split("/")[1]
    if (!canAccessRoute(payload.role as UserRole, basePath)) {
      // Redirect cashiers to POS, others to dashboard
      const redirectPath = payload.role === "cashier" ? "/pos" : "/dashboard"
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  // Redirect root to appropriate page
  if (path === "/") {
    if (payload) {
      const redirectPath = payload.role === "cashier" ? "/pos" : "/dashboard"
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
