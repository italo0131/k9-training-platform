import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { createAccessSnapshot } from "@/lib/access"

const PREMIUM_ROUTE_PREFIXES = ["/conteudos", "/training", "/calendar"]
const PREMIUM_FORUM_PATHS = ["/forum/new"]

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname
    const access = createAccessSnapshot({
      userId: req.nextauth.token?.sub as string | undefined,
      role: req.nextauth.token?.role as string | undefined,
      plan: req.nextauth.token?.plan as string | undefined,
      planStatus: req.nextauth.token?.planStatus as string | undefined,
      status: req.nextauth.token?.status as string | undefined,
      emailVerifiedAt: req.nextauth.token?.emailVerifiedAt as string | undefined,
    })

    const requiresPremium = PREMIUM_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
    const requiresPremiumForum = PREMIUM_FORUM_PATHS.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )

    if ((requiresPremium || requiresPremiumForum) && !access.hasPremiumAccess) {
      const url = req.nextUrl.clone()
      url.pathname = "/billing"
      url.searchParams.set("locked", pathname)
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/dogs/:path*",
    "/training/:path*",
    "/calendar/:path*",
    "/forum/:path*",
    "/conteudos/:path*",
    "/billing/:path*",
    "/financeiro/:path*",
    "/profile/:path*",
    "/verify/:path*",
    "/blog/new/:path*",
  ],
}
