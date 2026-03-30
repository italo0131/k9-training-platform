"use client"

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"

import { createAccessSnapshot, type AccessSnapshot } from "@/lib/access"

type PlatformSessionValue = {
  session: ReturnType<typeof useSession>["data"]
  status: ReturnType<typeof useSession>["status"]
  access: AccessSnapshot
  isLoggedIn: boolean
  isLoading: boolean
  role: string
  plan: string
  planStatus: string
  emailVerified: boolean
  isAdmin: boolean
  isRoot: boolean
  isStaff: boolean
  isProfessional: boolean
  isApprovedProfessional: boolean
  requiresProfessionalApproval: boolean
  hasPremiumAccess: boolean
  hasActivePlan: boolean
  refreshSession: () => Promise<unknown>
}

const PlatformSessionContext = createContext<PlatformSessionValue | null>(null)

export function PlatformSessionProvider({ children }: { children: ReactNode }) {
  const sessionState = useSession()
  const { data, status, update } = sessionState
  const [lastSyncedAt, setLastSyncedAt] = useState(0)

  const access = createAccessSnapshot({
    userId: data?.user?.id,
    role: data?.user?.role,
    plan: data?.user?.plan,
    planStatus: data?.user?.planStatus,
    status: data?.user?.status,
    emailVerifiedAt: data?.user?.emailVerifiedAt,
  })
  const role = access.role
  const plan = access.plan
  const planStatus = access.planStatus
  const isLoggedIn = status === "authenticated" && access.isLoggedIn
  const isLoading = status === "loading"
  const emailVerified = access.emailVerified
  const isAdmin = access.isAdmin
  const isRoot = access.isRoot
  const isStaff = access.isStaff
  const hasActivePlan = access.hasActivePlan
  const hasPremiumAccess = access.hasPremiumAccess

  const refreshSession = useEffectEvent(async () => {
    const now = Date.now()
    if (status !== "authenticated") return null
    if (now - lastSyncedAt < 15_000) return null

    setLastSyncedAt(now)
    return update()
  })

  useEffect(() => {
    const html = document.documentElement

    html.dataset.auth = isLoggedIn ? "authenticated" : status
    html.dataset.role = role.toLowerCase()
    html.dataset.plan = plan.toLowerCase()
    html.dataset.planStatus = planStatus.toLowerCase()

    html.classList.toggle("root-mode", isRoot)
    html.classList.toggle("logged-in", isLoggedIn)
    html.classList.toggle("premium-plan", hasPremiumAccess)
    html.classList.toggle("email-pending", isLoggedIn && !emailVerified)

    return () => {
      if (status === "unauthenticated") {
        html.classList.remove("root-mode", "logged-in", "premium-plan", "email-pending")
        html.dataset.auth = "unauthenticated"
        html.dataset.role = "guest"
        html.dataset.plan = "free"
        html.dataset.planStatus = "active"
      }
    }
  }, [emailVerified, hasPremiumAccess, isLoggedIn, isRoot, plan, planStatus, role, status])

  useEffect(() => {
    if (!isLoggedIn) return

    const syncVisibleSession = () => {
      if (document.visibilityState === "hidden") return
      startTransition(() => {
        void refreshSession()
      })
    }

    syncVisibleSession()
    const intervalId = window.setInterval(syncVisibleSession, 120_000)

    window.addEventListener("focus", syncVisibleSession)
    document.addEventListener("visibilitychange", syncVisibleSession)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", syncVisibleSession)
      document.removeEventListener("visibilitychange", syncVisibleSession)
    }
  }, [isLoggedIn, refreshSession])

  const value: PlatformSessionValue = {
    session: data,
    status,
    access,
    isLoggedIn,
    isLoading,
    role,
    plan,
    planStatus,
    emailVerified,
    isAdmin,
    isRoot,
    isStaff,
    isProfessional: access.isProfessional,
    isApprovedProfessional: access.isApprovedProfessional,
    requiresProfessionalApproval: access.requiresProfessionalApproval,
    hasPremiumAccess,
    hasActivePlan,
    refreshSession: () => refreshSession(),
  }

  return <PlatformSessionContext.Provider value={value}>{children}</PlatformSessionContext.Provider>
}

export function usePlatformSession() {
  const value = useContext(PlatformSessionContext)
  if (!value) {
    throw new Error("usePlatformSession deve ser usado dentro de PlatformSessionProvider")
  }
  return value
}
