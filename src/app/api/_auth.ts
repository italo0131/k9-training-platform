import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "./auth/[...nextauth]/route"
import { isAdminRole, isRootRole, isStaffRole } from "@/lib/role"

export async function requireApiUser() {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 }) }
  }
  return { session, error: null }
}

export async function requireApiStaff() {
  const { session, error } = await requireApiUser()
  if (error) return { session: null, error }
  if (!isStaffRole(session!.user.role)) {
    return { session: null, error: NextResponse.json({ success: false, message: "Acesso restrito" }, { status: 403 }) }
  }
  return { session, error: null }
}

export async function requireApiAdmin() {
  const { session, error } = await requireApiUser()
  if (error) return { session: null, error }
  if (!isAdminRole(session!.user.role)) {
    return { session: null, error: NextResponse.json({ success: false, message: "Acesso restrito a admin" }, { status: 403 }) }
  }
  return { session, error: null }
}

export async function requireApiRoot() {
  const { session, error } = await requireApiUser()
  if (error) return { session: null, error }
  if (!isRootRole(session!.user.role)) {
    return { session: null, error: NextResponse.json({ success: false, message: "Acesso restrito a root" }, { status: 403 }) }
  }
  return { session, error: null }
}
