import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

import { createAccessSnapshot } from "./src/lib/access"
import { isAdminRole, isRootRole, isStaffRole } from "./src/lib/role"


const ADMIN_PATHS = ["/admin", "/api/admin"]
const STAFF_PATHS = ["/forum/channels/new", "/conteudos/new", "/api/forum/channels", "/api/content"]
const PREMIUM_PATHS = ["/forum", "/conteudos", "/training", "/calendar", "/racas/ia", "/racas/comparador", "/racas/radar"]
const PROTECTED_PATHS = [
  "/billing",
  "/dashboard",
  "/financeiro",
  "/calendar",
  "/dogs",
  "/dogs/new",
  "/training",
  "/profile",
  "/blog/new",
  "/forum",
  "/forum/new",
  "/api/billing",
  "/api/dogs",
  "/api/training",
  "/api/schedule",
  "/api/profile",
  "/api/forum",
  "/api/content",
  "/api/subscription",
  "/api/verify",
]
const VERIFICATION_ALLOWED_PREFIXES = ["/dashboard", "/verify", "/api/verify", "/api/auth", "/logout", "/login", "/register"]
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' https:",
].join("; ")

function matchesPrefix(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

function isSecureRequest(req: NextRequest) {
  const forwardedProto = req.headers.get("x-forwarded-proto")
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https"
  }

  return req.nextUrl.protocol === "https:"
}

function applySecurityHeaders(req: NextRequest, response: NextResponse) {
  response.headers.set("Cache-Control", "no-store")
  response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY)
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-DNS-Prefetch-Control", "off")
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin")
  response.headers.set("Origin-Agent-Cluster", "?1")

  if (isSecureRequest(req)) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }

  return response
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  const requiresAuth = matchesPrefix(path, ADMIN_PATHS) || matchesPrefix(path, STAFF_PATHS) || matchesPrefix(path, PROTECTED_PATHS)

  if (!requiresAuth) {
    return applySecurityHeaders(req, NextResponse.next())
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", path)
    return applySecurityHeaders(req, NextResponse.redirect(loginUrl))
  }

  if ((token.status as string | undefined) === "SUSPENDED") {
    const blockedUrl = new URL("/login", req.url)
    blockedUrl.searchParams.set("reason", "suspended")
    return applySecurityHeaders(req, NextResponse.redirect(blockedUrl))
  }

  if (matchesPrefix(path, ADMIN_PATHS) && !isAdminRole(token.role as string)) {
    return applySecurityHeaders(req, NextResponse.redirect(new URL("/dashboard", req.url)))
  }

  const access = createAccessSnapshot({
    userId: token.sub as string | undefined,
    role: token.role as string | undefined,
    plan: token.plan as string | undefined,
    planStatus: token.planStatus as string | undefined,
    status: token.status as string | undefined,
    emailVerifiedAt: (token as { emailVerifiedAt?: string | null }).emailVerifiedAt,
  })

  if (matchesPrefix(path, STAFF_PATHS) && !isStaffRole(token.role as string)) {
    return applySecurityHeaders(req, NextResponse.redirect(new URL("/dashboard", req.url)))
  }

  if (matchesPrefix(path, PREMIUM_PATHS) && !access.hasPremiumAccess) {
    const billingUrl = new URL("/billing", req.url)
    billingUrl.searchParams.set("locked", path)
    return applySecurityHeaders(req, NextResponse.redirect(billingUrl))
  }

  if (!access.emailVerified && !isRootRole(token.role as string)) {
    const isAllowed = matchesPrefix(path, VERIFICATION_ALLOWED_PREFIXES)
    if (!isAllowed) {
      const verifyUrl = new URL("/verify", req.url)
      verifyUrl.searchParams.set("next", path)
      return applySecurityHeaders(req, NextResponse.redirect(verifyUrl))
    }
  }

  return applySecurityHeaders(req, NextResponse.next())
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/billing/:path*",
    "/financeiro/:path*",
    "/calendar/:path*",
    "/conteudos/:path*",
    "/dogs/:path*",
    "/forum/:path*",
    "/profile/:path*",
    "/racas/ia/:path*",
    "/racas/comparador/:path*",
    "/racas/radar/:path*",
    "/training/:path*",
    "/verify/:path*",
    "/api/admin/:path*",
    "/api/billing/:path*",
    "/api/content/:path*",
    "/api/dogs/:path*",
    "/api/forum/:path*",
    "/api/profile/:path*",
    "/api/schedule/:path*",
    "/api/subscription/:path*",
    "/api/training/:path*",
    "/api/verify/:path*",
    "/blog/new/:path*",
  ],
}
