export function isAdminRole(role?: string | null) {
  const r = (role || "").toLowerCase()
  return r === "admin" || r === "root" || r === "superadmin"
}

export function isRootRole(role?: string | null) {
  const r = (role || "").toLowerCase()
  return r === "root"
}

export function isStaffRole(role?: string | null) {
  const r = (role || "").toLowerCase()
  return isAdminRole(r) || r === "trainer"
}
