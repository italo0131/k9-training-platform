export const BILLING_PROVIDERS = ["STRIPE", "ASAAS"] as const

export type BillingProvider = (typeof BILLING_PROVIDERS)[number]

export function getBillingProvider(): BillingProvider {
  const configured = String(process.env.PAYMENT_PROVIDER || process.env.BILLING_PROVIDER || "ASAAS").toUpperCase()
  return configured === "STRIPE" ? "STRIPE" : "ASAAS"
}

export function getBillingProviderLabel(provider: BillingProvider = getBillingProvider()) {
  return provider === "STRIPE" ? "Stripe" : "Asaas"
}

export function isStripeBillingProvider(provider: BillingProvider = getBillingProvider()) {
  return provider === "STRIPE"
}
