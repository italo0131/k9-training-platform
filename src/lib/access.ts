import { hasPremiumPlatformAccess, isPaidPlan, isPlanActiveStatus } from "@/lib/platform"
import {
  isAdminRole,
  isApprovedProfessional,
  isProfessionalRole,
  isRootRole,
  isStaffRole,
  needsProfessionalApproval,
} from "@/lib/role"

type AccessSeed = {
  userId?: string | null
  role?: string | null
  plan?: string | null
  planStatus?: string | null
  status?: string | null
  emailVerifiedAt?: string | Date | null
}

export type AccessSnapshot = {
  userId: string | null
  role: string
  plan: string
  planStatus: string
  accountStatus: string
  isLoggedIn: boolean
  emailVerified: boolean
  isAdmin: boolean
  isRoot: boolean
  isStaff: boolean
  isProfessional: boolean
  isApprovedProfessional: boolean
  requiresProfessionalApproval: boolean
  hasPaidPlan: boolean
  hasActivePlan: boolean
  hasPremiumAccess: boolean
  checkoutRequired: boolean
  checkoutPending: boolean
  paymentPastDue: boolean
  planCanceled: boolean
  canCreatePaidChannel: boolean
  canOfferPaidServices: boolean
}

export function createAccessSnapshot(seed: AccessSeed = {}): AccessSnapshot {
  const userId = seed.userId || null
  const isLoggedIn = !!userId
  const role = String(seed.role || (isLoggedIn ? "CLIENT" : "GUEST")).toUpperCase()
  const plan = String(seed.plan || "FREE").toUpperCase()
  const planStatus = String(seed.planStatus || "ACTIVE").toUpperCase()
  const accountStatus = String(seed.status || (isLoggedIn ? "ACTIVE" : "GUEST")).toUpperCase()
  const emailVerified = !!seed.emailVerifiedAt
  const isAdmin = isAdminRole(role)
  const isRoot = isRootRole(role)
  const isStaff = isStaffRole(role)
  const isProfessional = isProfessionalRole(role)
  const approvedProfessional = isApprovedProfessional(role, accountStatus)
  const requiresProfessionalApproval = needsProfessionalApproval(role, accountStatus)
  const hasPaidPlan = isPaidPlan(plan)
  const hasActivePlan = isPlanActiveStatus(planStatus)
  const hasPremiumAccess = hasPremiumPlatformAccess(plan, role, planStatus, accountStatus)

  return {
    userId,
    role,
    plan,
    planStatus,
    accountStatus,
    isLoggedIn,
    emailVerified,
    isAdmin,
    isRoot,
    isStaff,
    isProfessional,
    isApprovedProfessional: approvedProfessional,
    requiresProfessionalApproval,
    hasPaidPlan,
    hasActivePlan,
    hasPremiumAccess,
    checkoutRequired: planStatus === "CHECKOUT_REQUIRED",
    checkoutPending: planStatus === "CHECKOUT_PENDING",
    paymentPastDue: planStatus === "PAST_DUE",
    planCanceled: planStatus === "CANCELED",
    canCreatePaidChannel: isAdmin || approvedProfessional,
    canOfferPaidServices: isAdmin || approvedProfessional,
  }
}
