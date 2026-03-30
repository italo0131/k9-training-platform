import { isAdminRole, isApprovedProfessional } from "@/lib/role"

export const REGISTERABLE_ROLES = ["CLIENT", "TRAINER", "VET"] as const

export const ACCOUNT_PLANS = ["FREE", "STANDARD"] as const
export const PAID_ACCOUNT_PLANS = ["STANDARD"] as const
export const FREE_PLAN_DOG_LIMIT = 3

export function normalizeAccountPlan(plan?: string | null) {
  const value = String(plan || "FREE").trim().toUpperCase()

  if (
    value === "STANDARD" ||
    value === "STANDARD_MONTHLY" ||
    value === "STARTER" ||
    value === "STARTER_YEARLY" ||
    value === "PRO" ||
    value === "PREMIUM" ||
    value === "PREMIUM_MONTH" ||
    value === "PREMIUM_MONTHLY" ||
    value === "PREMIUM_YEARLY" ||
    value === "PREMIUM_ANNUAL"
  ) {
    return "STANDARD"
  }

  return "FREE"
}

export const ACCOUNT_PLAN_OPTIONS = [
  {
    code: "FREE",
    name: "Free",
    priceLabel: "R$ 0",
    description: "Entrada leve para explorar a plataforma, estudar racas, ler dicas e organizar o basico da rotina.",
    perks: [
      "Ate 3 caes por conta",
      "Blog livre, racas e trilhas abertas",
      "Base da rotina, perfil e agenda enxuta",
      "Sem IA personalizada e sem canais premium",
    ],
  },
  {
    code: "STANDARD",
    name: "Standard",
    priceLabel: "R$ 29,90/mes",
    description: "Plano principal da plataforma para liberar cursos, IA, agenda completa, forum e canais premium.",
    perks: [
      "Cursos, comparador e IA liberados",
      "Treinos, agenda e forum com prioridade",
      "Base ideal para assinar canais e estudar com constancia",
    ],
  },
] as const

export const CHANNEL_CONTENT_TYPES = ["LESSON", "VIDEO", "CHECKLIST", "GUIDE", "LIVE_REPLAY"] as const
export const CHANNEL_CONTENT_CATEGORIES = [
  "TRILHA",
  "DICAS",
  "TECNICAS",
  "COMPORTAMENTO",
  "ROTINA",
  "SAUDE",
  "CONDICIONAMENTO",
] as const

export const CHANNEL_CONTENT_ACCESS = ["FREE", "SUBSCRIBER"] as const

export const TRAINING_FOCUS_AREAS = [
  "OBEDIENCIA",
  "SOCIALIZACAO",
  "ANSIEDADE",
  "CONDUTA_EM_PASSEIO",
  "ENRIQUECIMENTO",
  "ESPORTES",
  "REABILITACAO_COMPORTAMENTAL",
] as const

export const TRAINING_DIFFICULTIES = ["INICIANTE", "INTERMEDIARIO", "AVANCADO"] as const

export const SCHEDULE_FORMATS = ["PRESENTIAL", "ONLINE", "HYBRID"] as const

export const FORUM_POST_TYPES = ["POST", "DICA", "TECNICA", "COMPORTAMENTO", "EVENTO"] as const
export const BLOG_POST_TYPES = ["POST", "GUIA", "CASO_REAL", "REEL", "EVENTO"] as const

export function isPaidPlan(plan?: string | null) {
  return normalizeAccountPlan(plan) === "STANDARD"
}

export function isPlanActiveStatus(status?: string | null) {
  const value = String(status || "ACTIVE").toUpperCase()
  return value === "ACTIVE"
}

export function hasPremiumPlatformAccess(plan?: string | null, role?: string | null, planStatus?: string | null, accountStatus?: string | null) {
  if (isAdminRole(role)) return true
  if (isApprovedProfessional(role, accountStatus)) return true
  if (!isPaidPlan(plan)) return false
  if (typeof planStatus === "undefined" || planStatus === null || planStatus === "") return true
  return isPlanActiveStatus(planStatus)
}

export function getDogLimit(plan?: string | null, role?: string | null, planStatus?: string | null, accountStatus?: string | null) {
  if (hasPremiumPlatformAccess(plan, role, planStatus, accountStatus)) return Number.POSITIVE_INFINITY
  return FREE_PLAN_DOG_LIMIT
}

export function getRemainingDogSlots(
  currentDogs: number,
  plan?: string | null,
  role?: string | null,
  planStatus?: string | null,
  accountStatus?: string | null
) {
  const limit = getDogLimit(plan, role, planStatus, accountStatus)
  if (!Number.isFinite(limit)) return Number.POSITIVE_INFINITY
  return Math.max(0, limit - currentDogs)
}

export function getPlanStatusLabel(status?: string | null) {
  const value = String(status || "ACTIVE").toUpperCase()
  if (value === "CHECKOUT_PENDING") return "Checkout em andamento"
  if (value === "CHECKOUT_REQUIRED") return "Assinatura pendente"
  if (value === "PAST_DUE") return "Pagamento pendente"
  if (value === "CANCELED") return "Cancelado"
  return "Ativo"
}

export function getAccountPlanLabel(plan?: string | null) {
  return normalizeAccountPlan(plan) === "STANDARD" ? "Standard" : "Free"
}

export function getAccountPlanDescription(plan?: string | null) {
  if (normalizeAccountPlan(plan) === "STANDARD") {
    return "Libera cursos, IA, agenda completa, forum premium e assinatura de canais para a jornada completa na plataforma."
  }
  return "Acesso de entrada com blog, racas, trilhas abertas e ate 3 caes para comecar sem pressa."
}

export function getPlanUpgradeReason(reason?: string | null) {
  const value = String(reason || "").toLowerCase()
  if (value.includes("/forum")) return "O forum social completo e os canais profissionais pedem Standard ou acesso profissional aprovado."
  if (value.includes("/conteudos")) return "Os conteudos exclusivos dos profissionais fazem parte do Standard e da operacao profissional."
  if (value.includes("/training")) return "A trilha completa de treino faz parte do Standard."
  if (value.includes("/calendar")) return "A agenda completa faz parte do Standard e da operacao profissional."
  return "Essa area faz parte do Standard ou do acesso profissional aprovado."
}

export function getScheduleFormatLabel(format?: string | null) {
  const value = String(format || "PRESENTIAL").toUpperCase()
  if (value === "ONLINE") return "Online"
  if (value === "HYBRID") return "Hibrido"
  return "Presencial"
}

export function getTrainingDifficultyLabel(difficulty?: string | null) {
  const value = String(difficulty || "INICIANTE").toUpperCase()
  if (value === "INTERMEDIARIO") return "Intermediario"
  if (value === "AVANCADO") return "Avancado"
  return "Iniciante"
}

export function getChannelContentTypeLabel(type?: string | null) {
  const value = String(type || "LESSON").toUpperCase()
  if (value === "VIDEO") return "Video"
  if (value === "CHECKLIST") return "Checklist"
  if (value === "GUIDE") return "Guia"
  if (value === "LIVE_REPLAY") return "Replay"
  return "Aula"
}

export function getChannelContentCategoryLabel(category?: string | null) {
  const value = String(category || "TRILHA").toUpperCase()
  if (value === "DICAS") return "Dicas"
  if (value === "TECNICAS") return "Tecnicas"
  if (value === "COMPORTAMENTO") return "Comportamento"
  if (value === "ROTINA") return "Rotina"
  if (value === "SAUDE") return "Saude"
  if (value === "CONDICIONAMENTO") return "Condicionamento"
  return "Trilha"
}

export function getChannelContentAccessLabel(access?: string | null) {
  const value = String(access || "SUBSCRIBER").toUpperCase()
  if (value === "FREE") return "Livre"
  return "Assinantes"
}

export function isChannelSubscriptionActive(status?: string | null) {
  return String(status || "").toUpperCase() === "ACTIVE"
}

export function isChannelSubscriptionPending(status?: string | null) {
  const value = String(status || "").toUpperCase()
  return value === "PENDING_PAYMENT" || value === "CHECKOUT_PENDING"
}

export function getChannelSubscriptionStatusLabel(status?: string | null) {
  const value = String(status || "").toUpperCase()
  if (isChannelSubscriptionPending(value)) return "Checkout pendente"
  if (value === "CANCELED") return "Cancelada"
  return "Ativa"
}

export function getTrainingFocusLabel(value?: string | null) {
  return String(value || "OBEDIENCIA")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase())
}

export function getForumPostTypeLabel(value?: string | null) {
  const normalized = String(value || "POST").toUpperCase()
  if (normalized === "DICA") return "Dica"
  if (normalized === "TECNICA") return "Tecnica"
  if (normalized === "COMPORTAMENTO") return "Comportamento"
  if (normalized === "EVENTO") return "Evento"
  return "Post"
}

export function getBlogPostTypeLabel(value?: string | null) {
  const normalized = String(value || "POST").toUpperCase()
  if (normalized === "GUIA") return "Guia"
  if (normalized === "CASO_REAL") return "Caso real"
  if (normalized === "REEL") return "Reel"
  if (normalized === "EVENTO") return "Evento"
  return "Post"
}
