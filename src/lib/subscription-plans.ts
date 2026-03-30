import { normalizeAccountPlan } from "@/lib/platform"

export type PlatformBillingPlanCode = "FREE" | "STANDARD_MONTHLY"

export type PlatformBillingPlan = {
  code: PlatformBillingPlanCode
  accessPlan: "FREE" | "STANDARD"
  billingCycle: "MONTHLY" | null
  amountInCents: number
  name: string
  priceLabel: string
  description: string
  perks: string[]
}

export const PLATFORM_BILLING_PLANS: PlatformBillingPlan[] = [
  {
    code: "FREE",
    accessPlan: "FREE",
    billingCycle: null,
    amountInCents: 0,
    name: "Free",
    priceLabel: "R$ 0",
    description: "Entrada leve para explorar racas, blog, rotina basica e manter os primeiros registros da jornada.",
    perks: [
      "Ate 3 caes por conta",
      "Blog, racas e trilhas abertas",
      "Agenda enxuta e perfil basico",
      "Sem IA personalizada e sem canais pagos",
    ],
  },
  {
    code: "STANDARD_MONTHLY",
    accessPlan: "STANDARD",
    billingCycle: "MONTHLY",
    amountInCents: 2990,
    name: "Standard",
    priceLabel: "R$ 29,90/mes",
    description: "Plano principal da plataforma para liberar cursos, IA, agenda completa, comparador e canais premium.",
    perks: [
      "Cursos, comparador e IA liberados",
      "Treinos, agenda e forum com prioridade",
      "Pode assinar canais de profissionais",
      "Plano pago unico para deploy e operacao comercial",
    ],
  },
]

export function findPlatformBillingPlan(code?: string | null) {
  const normalized = String(code || "FREE").toUpperCase()

  if (normalizeAccountPlan(normalized) === "STANDARD") {
    return PLATFORM_BILLING_PLANS.find((plan) => plan.code === "STANDARD_MONTHLY") || PLATFORM_BILLING_PLANS[0]
  }

  return PLATFORM_BILLING_PLANS.find((plan) => plan.code === (normalized as PlatformBillingPlanCode)) || PLATFORM_BILLING_PLANS[0]
}

export function resolveActiveBillingPlanCode(plan?: string | null): PlatformBillingPlanCode {
  if (normalizeAccountPlan(plan) === "STANDARD") {
    return "STANDARD_MONTHLY"
  }

  return "FREE"
}
