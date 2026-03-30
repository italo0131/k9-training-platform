import { usePlatformSession } from "@/app/components/PlatformSessionProvider"

export function useAuth() {
  const {
    session,
    status,
    access,
    isLoggedIn,
    role,
    plan,
    planStatus,
    emailVerified,
    hasPremiumAccess,
    refreshSession,
  } = usePlatformSession()

  return {
    user: session?.user,
    status,
    access,
    role,
    plan,
    planStatus,
    emailVerified,
    hasPremiumAccess,
    isAuthenticated: isLoggedIn,
    refreshSession,
  }
}
