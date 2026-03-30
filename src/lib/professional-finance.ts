export const PLATFORM_COMMISSION_RATE = 0.2

const SETTLED_TRANSACTION_STATUSES = ["RECEIVED", "CONFIRMED", "PAID"] as const
const OPEN_TRANSACTION_STATUSES = ["PENDING", "OVERDUE", "CHECKOUT_PENDING"] as const

type ChannelFinanceSeed = {
  subscriptionPrice?: number | null
  onlinePrice?: number | null
  inPersonPrice?: number | null
  subscriptions?: Array<{ status?: string | null }>
}

type TransactionFinanceSeed = {
  status?: string | null
  grossAmount?: number | null
  feeAmount?: number | null
  netAmount?: number | null
}

function average(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function normalizeStatus(status?: string | null) {
  return String(status || "").trim().toUpperCase()
}

export function calculatePlatformCommission(amountInCents: number, rate = PLATFORM_COMMISSION_RATE) {
  if (!Number.isFinite(amountInCents) || amountInCents <= 0) return 0
  return Math.round(amountInCents * rate)
}

export function calculateProfessionalNet(amountInCents: number, rate = PLATFORM_COMMISSION_RATE) {
  return Math.max(0, amountInCents - calculatePlatformCommission(amountInCents, rate))
}

export function summarizeProfessionalCatalog(channels: ChannelFinanceSeed[]) {
  const normalizedChannels = channels || []
  const recurringChannels = normalizedChannels.filter((channel) => (channel.subscriptionPrice || 0) > 0)
  const activeSubscribers = normalizedChannels.reduce(
    (sum, channel) =>
      sum +
      (channel.subscriptions || []).filter((subscription) => String(subscription.status || "ACTIVE").toUpperCase() === "ACTIVE").length,
    0
  )
  const recurringGross = recurringChannels.reduce((sum, channel) => {
    const price = channel.subscriptionPrice || 0
    const subscribers = (channel.subscriptions || []).filter(
      (subscription) => String(subscription.status || "ACTIVE").toUpperCase() === "ACTIVE"
    ).length
    return sum + price * subscribers
  }, 0)

  const onlinePrices = normalizedChannels.map((channel) => channel.onlinePrice || 0).filter((value) => value > 0)
  const inPersonPrices = normalizedChannels.map((channel) => channel.inPersonPrice || 0).filter((value) => value > 0)

  return {
    activeSubscribers,
    paidChannelsCount: recurringChannels.length,
    recurringGross,
    platformCommission: calculatePlatformCommission(recurringGross),
    projectedNet: calculateProfessionalNet(recurringGross),
    onlineServicesCount: onlinePrices.length,
    inPersonServicesCount: inPersonPrices.length,
    averageOnlinePrice: average(onlinePrices),
    averageInPersonPrice: average(inPersonPrices),
    highestOnlinePrice: onlinePrices.length ? Math.max(...onlinePrices) : null,
    highestInPersonPrice: inPersonPrices.length ? Math.max(...inPersonPrices) : null,
  }
}

export function isSettledTransactionStatus(status?: string | null) {
  return SETTLED_TRANSACTION_STATUSES.includes(normalizeStatus(status) as (typeof SETTLED_TRANSACTION_STATUSES)[number])
}

export function isOpenTransactionStatus(status?: string | null) {
  return OPEN_TRANSACTION_STATUSES.includes(normalizeStatus(status) as (typeof OPEN_TRANSACTION_STATUSES)[number])
}

export function summarizeTransactionLedger(transactions: TransactionFinanceSeed[]) {
  return (transactions || []).reduce(
    (summary, transaction) => {
      summary.gross += transaction.grossAmount || 0
      summary.fee += transaction.feeAmount || 0
      summary.net += transaction.netAmount || 0
      return summary
    },
    { gross: 0, fee: 0, net: 0 }
  )
}
