import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { isAdminRole, isRootRole } from "./src/lib/role"

const ADMIN_PATHS = ["/admin", "/api/admin"]
const STAFF_PATHS: string[] = []
const PROTECTED_PATHS = [
  "/billing",
  "/calendar",
  "/dogs",
  "/dogs/new",
  "/training",
  "/profile",
  "/blog/new",
  "/forum",
  "/forum/new",
  "/forum/rules",
  "/api/billing",
  "/api/dogs",
  "/api/training",
  "/api/schedule",
  "/api/profile",
  "/api/forum",
]

export async function middleware(req: any) {
  const url = req.nextUrl
  const path = url.pathname

  const requiresAuth =
    ADMIN_PATHS.some((p) => path.startsWith(p)) ||
    STAFF_PATHS.some((p) => path.startsWith(p)) ||
    PROTECTED_PATHS.some((p) => path.startsWith(p))

  if (!requiresAuth) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (ADMIN_PATHS.some((p) => path.startsWith(p)) && !isAdminRole(token.role as string)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (STAFF_PATHS.some((p) => path.startsWith(p)) && !isAdminRole(token.role as string) && (token.role || "").toLowerCase() !== "trainer") {
    return NextResponse.redirect(new URL("/blog", req.url))
  }

  // exigir email verificado para áreas sensíveis (exceto dashboard e verificação)
  const emailVerifiedAt = (token as any).emailVerifiedAt
  const isVerified = !!emailVerifiedAt
  if (!isVerified && !isRootRole(token.role as string)) {
    const allowed = ["/dashboard", "/verify", "/api/verify", "/api/auth", "/logout", "/login", "/register"]
    const isAllowed = allowed.some((p) => path.startsWith(p))
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/verify", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/billing/:path*",
    "/calendar/:path*",
    "/blog/:path*",
    "/forum/:path*",
    "/api/admin/:path*",
    "/api/billing/:path*",
    "/api/blog/:path*",
    "/api/forum/:path*",
  ],
}
