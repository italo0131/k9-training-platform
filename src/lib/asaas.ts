const DEFAULT_SANDBOX_API_URL = "https://api-sandbox.asaas.com/v3"
const DEFAULT_PRODUCTION_API_URL = "https://api.asaas.com/v3"

type AsaasRequestOptions = {
  method?: "GET" | "POST" | "DELETE"
  body?: unknown
}

export type AsaasCustomer = {
  id: string
  name?: string | null
  email?: string | null
  mobilePhone?: string | null
  phone?: string | null
}

export type AsaasSubscription = {
  id: string
  customer?: string | null
  value?: number | null
  status?: string | null
  billingType?: string | null
  cycle?: string | null
  description?: string | null
  nextDueDate?: string | null
  externalReference?: string | null
}

export type AsaasPayment = {
  id: string
  customer?: string | null
  subscription?: string | null
  status?: string | null
  billingType?: string | null
  value?: number | null
  netValue?: number | null
  originalValue?: number | null
  description?: string | null
  invoiceUrl?: string | null
  bankSlipUrl?: string | null
  transactionReceiptUrl?: string | null
  dueDate?: string | null
  paymentDate?: string | null
  dateCreated?: string | null
  externalReference?: string | null
}

type AsaasListResponse<T> = {
  data?: T[]
}

type AsaasErrorPayload = {
  errors?: Array<{
    code?: string
    description?: string
  }>
}

export class AsaasApiError extends Error {
  status: number
  details: AsaasErrorPayload | null

  constructor(message: string, status: number, details: AsaasErrorPayload | null = null) {
    super(message)
    this.name = "AsaasApiError"
    this.status = status
    this.details = details
  }
}

function shouldUseSandbox() {
  return String(process.env.ASAAS_SANDBOX || "").toLowerCase() === "true"
}

function assertAsaasApiKeyConsistency(apiKey: string) {
  const normalizedKey = apiKey.trim().toLowerCase()

  if (!normalizedKey) {
    throw new AsaasApiError("ASAAS_API_KEY nao configurada.", 500)
  }

  if (normalizedKey.startsWith("$")) {
    throw new AsaasApiError(
      "ASAAS_API_KEY parece comecar com '$'. Corrija a chave no ambiente antes de tentar novas assinaturas.",
      500
    )
  }

  const isHomologationKey = normalizedKey.includes("_hmlg_")
  if (shouldUseSandbox() && !isHomologationKey) {
    throw new AsaasApiError("ASAAS_SANDBOX=true, mas a chave configurada nao parece ser de homologacao.", 500)
  }

  if (!shouldUseSandbox() && isHomologationKey) {
    throw new AsaasApiError("ASAAS_SANDBOX=false, mas a chave configurada e de homologacao.", 500)
  }
}

export function getAsaasApiUrl() {
  const explicitUrl = String(process.env.ASAAS_API_URL || process.env.ASAAS_API_BASE_URL || process.env.ASAAS_BASE_URL || "").trim()
  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "")
  }

  return shouldUseSandbox() ? DEFAULT_SANDBOX_API_URL : DEFAULT_PRODUCTION_API_URL
}

export function getAsaasWebhookToken() {
  return String(process.env.ASAAS_WEBHOOK_TOKEN || "").trim()
}

export function isAsaasConfigured() {
  return !!String(process.env.ASAAS_API_KEY || "").trim()
}

export function getAsaasApiKey() {
  const apiKey = String(process.env.ASAAS_API_KEY || "").trim()
  assertAsaasApiKeyConsistency(apiKey)
  return apiKey
}

function normalizePhone(phone?: string | null) {
  const digits = String(phone || "").replace(/\D/g, "")
  return digits || undefined
}

async function asaasRequest<T>(path: string, options: AsaasRequestOptions = {}) {
  const method = options.method || "GET"
  const response = await fetch(`${getAsaasApiUrl()}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      access_token: getAsaasApiKey(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => null)) as T | AsaasErrorPayload | null

  if (!response.ok) {
    const details = payload && typeof payload === "object" ? (payload as AsaasErrorPayload) : null
    const description = details?.errors?.[0]?.description
    throw new AsaasApiError(description || "Falha ao comunicar com o Asaas.", response.status, details)
  }

  return payload as T
}

export function formatAsaasDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export async function findAsaasCustomerByEmail(email: string) {
  const normalizedEmail = String(email || "").trim().toLowerCase()
  if (!normalizedEmail) return null

  try {
    const response = await asaasRequest<AsaasListResponse<AsaasCustomer>>(
      `/customers?email=${encodeURIComponent(normalizedEmail)}`
    )
    return response.data?.[0] || null
  } catch {
    return null
  }
}

export async function createAsaasCustomer(input: {
  name: string
  email: string
  phone?: string | null
  externalReference?: string
}) {
  return asaasRequest<AsaasCustomer>("/customers", {
    method: "POST",
    body: {
      name: input.name,
      email: input.email,
      mobilePhone: normalizePhone(input.phone),
      externalReference: input.externalReference,
    },
  })
}

export async function ensureAsaasCustomer(input: {
  customerId?: string | null
  name: string
  email: string
  phone?: string | null
  externalReference?: string
}) {
  if (input.customerId) {
    return { id: input.customerId, reused: true }
  }

  const existingCustomer = await findAsaasCustomerByEmail(input.email)
  if (existingCustomer?.id) {
    return { id: existingCustomer.id, reused: true }
  }

  const createdCustomer = await createAsaasCustomer(input)
  return { id: createdCustomer.id, reused: false }
}

export async function createAsaasSubscription(input: {
  customer: string
  billingType: string
  value: number
  nextDueDate: string
  cycle: string
  description: string
  endDate?: string
}) {
  return asaasRequest<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: {
      customer: input.customer,
      billingType: input.billingType,
      value: input.value,
      nextDueDate: input.nextDueDate,
      cycle: input.cycle,
      description: input.description,
      endDate: input.endDate,
    },
  })
}

export async function listAsaasSubscriptionPayments(subscriptionId: string) {
  return asaasRequest<AsaasListResponse<AsaasPayment>>(`/subscriptions/${subscriptionId}/payments`)
}

export async function cancelAsaasSubscription(subscriptionId: string) {
  return asaasRequest<{ deleted?: boolean; id?: string }>(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  })
}

function resolvePaymentUrl(payment?: AsaasPayment | null) {
  if (!payment) return null
  return payment.invoiceUrl || payment.bankSlipUrl || payment.transactionReceiptUrl || null
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitForSubscriptionPaymentUrl(subscriptionId: string, attempts = 5) {
  let firstPayment: AsaasPayment | null = null

  for (let index = 0; index < attempts; index += 1) {
    const payments = await listAsaasSubscriptionPayments(subscriptionId)
    firstPayment = payments.data?.[0] || null
    const url = resolvePaymentUrl(firstPayment)
    if (url) {
      return { payment: firstPayment, url }
    }

    await sleep(500 * (index + 1))
  }

  return { payment: firstPayment, url: resolvePaymentUrl(firstPayment) }
}

export function centsToAsaasValue(amountInCents: number) {
  return Number((amountInCents / 100).toFixed(2))
}
