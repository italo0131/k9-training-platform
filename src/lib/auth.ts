import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { isAdminRole, isStaffRole } from "@/lib/role"

export async function getAuthSession() {
  return getServerSession(authOptions as any)
}

export async function requireUser(redirectTo: string = "/login") {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    redirect(redirectTo)
  }
  return session
}

export function isAdminSession(session: any) {
  return isAdminRole(session?.user?.role)
}

export function isStaffSession(session: any) {
  return isStaffRole(session?.user?.role)
}
