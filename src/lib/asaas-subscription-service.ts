import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import {
  addDays,
  AsaasApiError,
  cancelAsaasSubscription,
  centsToAsaasValue,
  createAsaasSubscription,
  ensureAsaasCustomer,
  formatAsaasDate,
  waitForSubscriptionPaymentUrl,
} from "@/lib/asaas"
import { calculatePlatformCommission, calculateProfessionalNet } from "@/lib/professional-finance"
import { findPlatformBillingPlan } from "@/lib/subscription-plans"

export class BillingServiceError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "BillingServiceError"
    this.status = status
  }
}

function buildReference(prefix: string, userId: string, scope?: string) {
  return [prefix, userId, scope || "global", Date.now().toString(36)].join("_")
}

function buildPlatformDescription(planName: string) {
  return `K9 Training Platform - ${planName}`
}

function buildChannelDescription(channelName: string) {
  return `K9 Training Platform - Assinatura do canal ${channelName}`
}

function isPendingStatus(status?: string | null) {
  const normalized = String(status || "").toUpperCase()
  return normalized === "PENDING" || normalized === "CHECKOUT_PENDING"
}

function normalizeAsaasError(error: unknown) {
  if (error instanceof BillingServiceError) {
    return error
  }

  if (error instanceof AsaasApiError) {
    return new BillingServiceError(error.message, error.status >= 400 && error.status < 600 ? error.status : 502)
  }

  return new BillingServiceError("Nao foi possivel iniciar a cobranca agora.", 500)
}

export async function createPlatformCheckout(input: {
  userId: string
  requestedPlanCode: string
}) {
  const plan = findPlatformBillingPlan(input.requestedPlanCode)
  if (plan.code === "FREE" || !plan.billingCycle) {
    throw new BillingServiceError("Escolha um plano Standard valido para continuar.", 400)
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      plan: true,
      planStatus: true,
      asaasCustomerId: true,
    },
  })

  if (!user?.email) {
    throw new BillingServiceError("Nao encontramos uma conta valida para iniciar a assinatura.", 404)
  }

  const activePlatformSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      planType: "PLATFORM",
      status: { in: ["ACTIVE", "CHECKOUT_PENDING", "PENDING"] },
    },
    orderBy: { createdAt: "desc" },
  })

  if (activePlatformSubscription?.status === "ACTIVE") {
    throw new BillingServiceError("Sua assinatura Standard ja esta ativa. Para mudar o ciclo, primeiro cancele a assinatura atual.", 409)
  }

  try {
    const customer = await ensureAsaasCustomer({
      customerId: user.asaasCustomerId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      externalReference: user.id,
    })

    if (!user.asaasCustomerId || customer.id !== user.asaasCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId: customer.id },
      })
    }

    const now = new Date()
    const nextDueDate = formatAsaasDate(addDays(now, 1))
    const externalReference = buildReference("platform", user.id, plan.code.toLowerCase())

    await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        planType: "PLATFORM",
        status: { in: ["PENDING", "CHECKOUT_PENDING"] },
      },
      data: {
        status: "REPLACED",
        checkoutStatus: "REPLACED",
        paymentStatus: "CANCELED",
        endAt: now,
      },
    })

    const ledger = await prisma.subscription.create({
      data: {
        externalReference,
        provider: "ASAAS",
        planType: "PLATFORM",
        planCode: plan.accessPlan,
        billingCycle: plan.billingCycle,
        amount: plan.amountInCents,
        asaasCustomerId: customer.id,
        status: "PENDING",
        checkoutStatus: "CREATED",
        paymentStatus: "PENDING",
        userId: user.id,
      },
    })

    const asaasSubscription = await createAsaasSubscription({
      customer: customer.id,
      billingType: "UNDEFINED",
      value: centsToAsaasValue(plan.amountInCents),
      nextDueDate,
      cycle: plan.billingCycle,
      description: buildPlatformDescription(plan.name),
    })

    const paymentResult = await waitForSubscriptionPaymentUrl(asaasSubscription.id)

    if (!paymentResult.url) {
      throw new BillingServiceError("A assinatura foi criada, mas o link de pagamento ainda nao ficou disponivel no Asaas.", 502)
    }

    const transactionSteps: Prisma.PrismaPromise<unknown>[] = [
      prisma.subscription.update({
        where: { id: ledger.id },
        data: {
          asaasSubscriptionId: asaasSubscription.id,
          asaasPaymentId: paymentResult.payment?.id || null,
          status: "CHECKOUT_PENDING",
          checkoutStatus: "READY",
          paymentStatus: String(paymentResult.payment?.status || "PENDING").toUpperCase(),
        },
      }),
    ]

    if (String(user.plan || "FREE").toUpperCase() === "FREE" || String(user.planStatus || "ACTIVE").toUpperCase() !== "ACTIVE") {
      transactionSteps.push(
        prisma.user.update({
          where: { id: user.id },
          data: {
            plan: plan.accessPlan,
            planStatus: "CHECKOUT_PENDING",
            planActivatedAt: null,
          },
        })
      )
    }

    await prisma.$transaction(transactionSteps)

    return {
      url: paymentResult.url,
      plan,
      subscriptionId: ledger.id,
    }
  } catch (error) {
    throw normalizeAsaasError(error)
  }
}

export async function createChannelCheckout(input: {
  userId: string
  channelId: string
}) {
  const [user, channel, existingChannelSubscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        asaasCustomerId: true,
      },
    }),
    prisma.forumChannel.findUnique({
      where: { id: input.channelId },
      select: {
        id: true,
        slug: true,
        name: true,
        ownerId: true,
        isPublic: true,
        subscriptionPrice: true,
      },
    }),
    prisma.channelSubscription.findUnique({
      where: {
        channelId_userId: {
          channelId: input.channelId,
          userId: input.userId,
        },
      },
    }),
  ])

  if (!user?.email) {
    throw new BillingServiceError("Nao encontramos uma conta valida para iniciar a assinatura.", 404)
  }

  if (!channel?.id || !channel.isPublic) {
    throw new BillingServiceError("Canal nao encontrado.", 404)
  }

  if (channel.ownerId === input.userId) {
    throw new BillingServiceError("Voce ja e dono deste canal.", 400)
  }

  const amount = Number(channel.subscriptionPrice || 0)
  if (amount <= 0) {
    throw new BillingServiceError("Este canal nao possui assinatura paga configurada.", 400)
  }

  if (existingChannelSubscription?.status === "ACTIVE") {
    throw new BillingServiceError("Sua assinatura deste canal ja esta ativa.", 409)
  }

  try {
    const customer = await ensureAsaasCustomer({
      customerId: user.asaasCustomerId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      externalReference: user.id,
    })

    if (!user.asaasCustomerId || customer.id !== user.asaasCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId: customer.id },
      })
    }

    const now = new Date()
    const nextDueDate = formatAsaasDate(addDays(now, 1))
    const externalReference = buildReference("channel", user.id, channel.id)

    await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        channelId: channel.id,
        planType: "CHANNEL",
        status: { in: ["PENDING", "CHECKOUT_PENDING"] },
      },
      data: {
        status: "REPLACED",
        checkoutStatus: "REPLACED",
        paymentStatus: "CANCELED",
        endAt: now,
      },
    })

    const channelSubscription = existingChannelSubscription
      ? await prisma.channelSubscription.update({
          where: { id: existingChannelSubscription.id },
          data: {
            status: "PENDING_PAYMENT",
            tier: "PAID",
            paymentStatus: "PENDING",
            endedAt: null,
          },
        })
      : await prisma.channelSubscription.create({
          data: {
            channelId: channel.id,
            userId: user.id,
            status: "PENDING_PAYMENT",
            tier: "PAID",
            paymentStatus: "PENDING",
          },
        })

    const ledger = await prisma.subscription.create({
      data: {
        externalReference,
        provider: "ASAAS",
        planType: "CHANNEL",
        planCode: channel.slug,
        billingCycle: "MONTHLY",
        amount,
        commissionAmount: calculatePlatformCommission(amount),
        netAmount: calculateProfessionalNet(amount),
        asaasCustomerId: customer.id,
        status: "PENDING",
        checkoutStatus: "CREATED",
        paymentStatus: "PENDING",
        userId: user.id,
        channelId: channel.id,
        channelSubscriptionId: channelSubscription.id,
      },
    })

    const asaasSubscription = await createAsaasSubscription({
      customer: customer.id,
      billingType: "UNDEFINED",
      value: centsToAsaasValue(amount),
      nextDueDate,
      cycle: "MONTHLY",
      description: buildChannelDescription(channel.name),
    })

    const paymentResult = await waitForSubscriptionPaymentUrl(asaasSubscription.id)

    if (!paymentResult.url) {
      throw new BillingServiceError("A assinatura foi criada, mas o link de pagamento ainda nao ficou disponivel no Asaas.", 502)
    }

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: ledger.id },
        data: {
          asaasSubscriptionId: asaasSubscription.id,
          asaasPaymentId: paymentResult.payment?.id || null,
          status: "CHECKOUT_PENDING",
          checkoutStatus: "READY",
          paymentStatus: String(paymentResult.payment?.status || "PENDING").toUpperCase(),
        },
      }),
      prisma.channelSubscription.update({
        where: { id: channelSubscription.id },
        data: {
          status: "PENDING_PAYMENT",
          paymentStatus: String(paymentResult.payment?.status || "PENDING").toUpperCase(),
          asaasSubscriptionId: asaasSubscription.id,
          asaasPaymentId: paymentResult.payment?.id || null,
        },
      }),
    ])

    return {
      url: paymentResult.url,
      channel,
      subscriptionId: ledger.id,
    }
  } catch (error) {
    throw normalizeAsaasError(error)
  }
}

export async function cancelChannelCheckoutOrSubscription(input: {
  userId: string
  channelId: string
}) {
  const channelSubscription = await prisma.channelSubscription.findUnique({
    where: {
      channelId_userId: {
        channelId: input.channelId,
        userId: input.userId,
      },
    },
  })

  if (!channelSubscription || channelSubscription.status === "CANCELED") {
    throw new BillingServiceError("Assinatura nao encontrada.", 404)
  }

  const currentLedger = await prisma.subscription.findFirst({
    where: {
      userId: input.userId,
      channelId: input.channelId,
      planType: "CHANNEL",
      status: { in: ["ACTIVE", "PENDING", "CHECKOUT_PENDING"] },
    },
    orderBy: { createdAt: "desc" },
  })

  if (channelSubscription.asaasSubscriptionId) {
    try {
      await cancelAsaasSubscription(channelSubscription.asaasSubscriptionId)
    } catch (error) {
      const normalized = normalizeAsaasError(error)
      if (normalized.status >= 500) {
        throw normalized
      }
    }
  }

  const now = new Date()
  const transactionSteps: Prisma.PrismaPromise<unknown>[] = [
    prisma.channelSubscription.update({
      where: { id: channelSubscription.id },
      data: {
        status: "CANCELED",
        paymentStatus: "CANCELED",
        endedAt: now,
      },
    }),
  ]

  if (currentLedger?.id) {
    transactionSteps.push(
      prisma.subscription.update({
        where: { id: currentLedger.id },
        data: {
          status: "CANCELED",
          checkoutStatus: "CANCELED",
          paymentStatus: "CANCELED",
          endAt: now,
        },
      })
    )
  }

  await prisma.$transaction(transactionSteps)

  return {
    ...channelSubscription,
    status: "CANCELED",
    paymentStatus: "CANCELED",
    endedAt: now,
  }
}

export function isChannelSubscriptionPendingStatus(status?: string | null) {
  return isPendingStatus(status) || String(status || "").toUpperCase() === "PENDING_PAYMENT"
}

export async function cancelPlatformSubscription(input: { userId: string }) {
  const currentLedger = await prisma.subscription.findFirst({
    where: {
      userId: input.userId,
      planType: "PLATFORM",
      status: { in: ["ACTIVE", "PENDING", "CHECKOUT_PENDING", "PAST_DUE"] },
    },
    orderBy: { createdAt: "desc" },
  })

  if (currentLedger?.asaasSubscriptionId) {
    try {
      await cancelAsaasSubscription(currentLedger.asaasSubscriptionId)
    } catch (error) {
      const normalized = normalizeAsaasError(error)
      if (normalized.status >= 500) {
        throw normalized
      }
    }
  }

  const now = new Date()
  const transactionSteps: Prisma.PrismaPromise<unknown>[] = [
    prisma.user.update({
      where: { id: input.userId },
      data: {
        plan: "FREE",
        planStatus: "ACTIVE",
        planActivatedAt: now,
      },
    }),
  ]

  if (currentLedger?.id) {
    transactionSteps.push(
      prisma.subscription.update({
        where: { id: currentLedger.id },
        data: {
          status: "CANCELED",
          checkoutStatus: "CANCELED",
          paymentStatus: "CANCELED",
          endAt: now,
        },
      })
    )
  }

  await prisma.$transaction(transactionSteps)

  return { canceledAt: now }
}
