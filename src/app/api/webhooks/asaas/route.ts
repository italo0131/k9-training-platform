import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { getAsaasWebhookToken } from "@/lib/asaas"
import { prisma } from "@/lib/prisma"

type AsaasWebhookPayload = {
  id?: string
  event?: string
  payment?: {
    id?: string
    customer?: string | null
    subscription?: string | null
    status?: string | null
    value?: number | null
    netValue?: number | null
    description?: string | null
    dueDate?: string | null
    paymentDate?: string | null
    billingType?: string | null
  }
  subscription?: {
    id?: string
    customer?: string | null
    status?: string | null
    value?: number | null
    description?: string | null
    nextDueDate?: string | null
    cycle?: string | null
  }
  checkout?: {
    id?: string
    status?: string | null
    customer?: string | null
  }
}

function normalizeStatus(value?: string | null) {
  return String(value || "").toUpperCase()
}

function toCents(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return Math.round(value * 100)
}

function resolveReceiptId(eventId: string) {
  return `asaas:${eventId}`
}

function isPaymentActiveEvent(event: string, paymentStatus: string) {
  return event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED" || paymentStatus === "RECEIVED" || paymentStatus === "CONFIRMED"
}

function isPaymentPastDueEvent(event: string, paymentStatus: string) {
  return event === "PAYMENT_OVERDUE" || paymentStatus === "OVERDUE"
}

function isCanceledEvent(event: string, paymentStatus: string, subscriptionStatus: string) {
  return (
    event === "SUBSCRIPTION_DELETED" ||
    event === "SUBSCRIPTION_INACTIVATED" ||
    event === "PAYMENT_DELETED" ||
    event === "PAYMENT_REFUNDED" ||
    paymentStatus === "REFUNDED" ||
    subscriptionStatus === "INACTIVE"
  )
}

function resolveNextLedgerStatus(args: {
  currentStatus: string
  event: string
  paymentStatus: string
  subscriptionStatus: string
}) {
  if (isCanceledEvent(args.event, args.paymentStatus, args.subscriptionStatus)) {
    return "CANCELED"
  }

  if (isPaymentPastDueEvent(args.event, args.paymentStatus)) {
    return "PAST_DUE"
  }

  if (isPaymentActiveEvent(args.event, args.paymentStatus)) {
    return "ACTIVE"
  }

  if (args.currentStatus === "ACTIVE") {
    return "ACTIVE"
  }

  return "CHECKOUT_PENDING"
}

async function findInternalSubscription(tx: Prisma.TransactionClient, payload: AsaasWebhookPayload) {
  const asaasSubscriptionId = String(payload.subscription?.id || payload.payment?.subscription || "").trim()
  if (asaasSubscriptionId) {
    const bySubscription = await tx.subscription.findUnique({
      where: { asaasSubscriptionId },
    })
    if (bySubscription) return bySubscription
  }

  const asaasPaymentId = String(payload.payment?.id || "").trim()
  if (asaasPaymentId) {
    const byPayment = await tx.subscription.findFirst({
      where: { asaasPaymentId },
      orderBy: { createdAt: "desc" },
    })
    if (byPayment) return byPayment
  }

  const asaasCustomerId = String(payload.subscription?.customer || payload.payment?.customer || payload.checkout?.customer || "").trim()
  const amount = toCents(payload.payment?.value ?? payload.subscription?.value ?? null)

  if (!asaasCustomerId) return null

  return tx.subscription.findFirst({
    where: {
      asaasCustomerId,
      amount: amount ?? undefined,
      status: { in: ["PENDING", "CHECKOUT_PENDING"] },
    },
    orderBy: { createdAt: "desc" },
  })
}

async function syncLinkedAccess(
  tx: Prisma.TransactionClient,
  subscription: {
    id: string
    userId: string
    channelId: string | null
    channelSubscriptionId: string | null
    planType: string
    planCode: string | null
    status: string
  },
  nextLedgerStatus: string,
  paymentStatus: string,
  occurredAt: Date
) {
  if (subscription.planType === "PLATFORM") {
    if (nextLedgerStatus === "ACTIVE") {
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          plan: subscription.planCode || "STANDARD",
          planStatus: "ACTIVE",
          planActivatedAt: occurredAt,
        },
      })
      return
    }

    if (nextLedgerStatus === "PAST_DUE") {
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          plan: subscription.planCode || "STANDARD",
          planStatus: "PAST_DUE",
        },
      })
      return
    }

    if (nextLedgerStatus === "CANCELED") {
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          plan: "FREE",
          planStatus: "ACTIVE",
          planActivatedAt: null,
        },
      })
      return
    }

    if (subscription.status !== "ACTIVE") {
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          plan: subscription.planCode || "STANDARD",
          planStatus: "CHECKOUT_PENDING",
          planActivatedAt: null,
        },
      })
    }

    return
  }

  if (!subscription.channelSubscriptionId) return

  if (nextLedgerStatus === "ACTIVE") {
    await tx.channelSubscription.update({
      where: { id: subscription.channelSubscriptionId },
      data: {
        status: "ACTIVE",
        paymentStatus: paymentStatus || "RECEIVED",
        startedAt: occurredAt,
        endedAt: null,
      },
    })
    return
  }

  if (nextLedgerStatus === "CANCELED") {
    await tx.channelSubscription.update({
      where: { id: subscription.channelSubscriptionId },
      data: {
        status: "CANCELED",
        paymentStatus: "CANCELED",
        endedAt: occurredAt,
      },
    })
    return
  }

  if (nextLedgerStatus === "PAST_DUE") {
    await tx.channelSubscription.update({
      where: { id: subscription.channelSubscriptionId },
      data: {
        status: "PENDING_PAYMENT",
        paymentStatus: paymentStatus || "OVERDUE",
      },
    })
    return
  }

  if (subscription.status !== "ACTIVE") {
    await tx.channelSubscription.update({
      where: { id: subscription.channelSubscriptionId },
      data: {
        status: "PENDING_PAYMENT",
        paymentStatus: paymentStatus || "PENDING",
        endedAt: null,
      },
    })
  }
}

export async function POST(req: Request) {
  const configuredToken = getAsaasWebhookToken()
  const receivedToken = req.headers.get("asaas-access-token")

  if (configuredToken && receivedToken !== configuredToken) {
    return NextResponse.json({ success: false, message: "Webhook nao autorizado." }, { status: 401 })
  }

  const payload = (await req.json().catch(() => null)) as AsaasWebhookPayload | null
  if (!payload?.id || !payload?.event) {
    return NextResponse.json({ success: false, message: "Payload invalido." }, { status: 400 })
  }

  const receiptId = resolveReceiptId(payload.id)
  const paymentStatus = normalizeStatus(payload.payment?.status)
  const subscriptionStatus = normalizeStatus(payload.subscription?.status)
  const occurredAt = new Date()
  const rawPayload = JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          stripeEventId: receiptId,
          type: payload.event || "ASAAS_EVENT",
          status: paymentStatus || subscriptionStatus || normalizeStatus(payload.checkout?.status) || null,
          amount: toCents(payload.payment?.value ?? payload.subscription?.value ?? null),
          currency: "BRL",
          customerId: payload.payment?.customer || payload.subscription?.customer || payload.checkout?.customer || null,
          raw: JSON.stringify(payload),
        },
      })

      const internalSubscription = await findInternalSubscription(tx, payload)
      if (!internalSubscription) {
        return
      }

      const nextLedgerStatus = resolveNextLedgerStatus({
        currentStatus: normalizeStatus(internalSubscription.status),
        event: normalizeStatus(payload.event),
        paymentStatus,
        subscriptionStatus,
      })

      const nextPaymentStatus = paymentStatus || subscriptionStatus || normalizeStatus(payload.checkout?.status) || internalSubscription.paymentStatus || "PENDING"
      const nextCheckoutStatus =
        nextLedgerStatus === "ACTIVE"
          ? "PAID"
          : nextLedgerStatus === "CANCELED"
            ? "CANCELED"
            : nextLedgerStatus === "PAST_DUE"
              ? "PAST_DUE"
              : "PENDING"

      const grossAmount = toCents(payload.payment?.value ?? payload.subscription?.value ?? null) ?? internalSubscription.amount
      const netAmount =
        internalSubscription.planType === "CHANNEL"
          ? Math.max(0, grossAmount - (internalSubscription.commissionAmount || 0))
          : grossAmount
      const feeAmount = internalSubscription.planType === "CHANNEL" ? internalSubscription.commissionAmount || 0 : 0

      await tx.subscription.update({
        where: { id: internalSubscription.id },
        data: {
          status: nextLedgerStatus,
          checkoutStatus: nextCheckoutStatus,
          paymentStatus: nextPaymentStatus,
          asaasSubscriptionId: payload.subscription?.id || payload.payment?.subscription || internalSubscription.asaasSubscriptionId,
          asaasPaymentId: payload.payment?.id || internalSubscription.asaasPaymentId,
          asaasCustomerId:
            payload.subscription?.customer ||
            payload.payment?.customer ||
            payload.checkout?.customer ||
            internalSubscription.asaasCustomerId,
          startAt: nextLedgerStatus === "ACTIVE" ? internalSubscription.startAt || occurredAt : internalSubscription.startAt,
          endAt: nextLedgerStatus === "CANCELED" ? occurredAt : internalSubscription.endAt,
        },
      })

      await syncLinkedAccess(
        tx,
        {
          id: internalSubscription.id,
          userId: internalSubscription.userId,
          channelId: internalSubscription.channelId,
          channelSubscriptionId: internalSubscription.channelSubscriptionId,
          planType: internalSubscription.planType,
          planCode: internalSubscription.planCode,
          status: normalizeStatus(internalSubscription.status),
        },
        nextLedgerStatus,
        nextPaymentStatus,
        occurredAt
      )

      if (payload.payment?.id) {
        await tx.transaction.upsert({
          where: { externalPaymentId: payload.payment.id },
          create: {
            provider: "ASAAS",
            providerEventId: receiptId,
            externalPaymentId: payload.payment.id,
            externalSubscriptionId: payload.payment.subscription || payload.subscription?.id || internalSubscription.asaasSubscriptionId || undefined,
            type: normalizeStatus(payload.event),
            status: nextPaymentStatus,
            grossAmount,
            feeAmount,
            netAmount,
            currency: "BRL",
            description: payload.payment.description || payload.subscription?.description || null,
            raw: rawPayload,
            userId: internalSubscription.userId,
            channelId: internalSubscription.channelId || undefined,
            subscriptionId: internalSubscription.id,
          },
          update: {
            providerEventId: receiptId,
            externalSubscriptionId: payload.payment.subscription || payload.subscription?.id || internalSubscription.asaasSubscriptionId || undefined,
            type: normalizeStatus(payload.event),
            status: nextPaymentStatus,
            grossAmount,
            feeAmount,
            netAmount,
            currency: "BRL",
            description: payload.payment.description || payload.subscription?.description || null,
            raw: rawPayload,
            userId: internalSubscription.userId,
            channelId: internalSubscription.channelId || undefined,
            subscriptionId: internalSubscription.id,
          },
        })
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true })
    }

    console.error("ERRO POST /api/webhooks/asaas:", error)
    return NextResponse.json({ success: false, message: "Erro ao processar webhook do Asaas." }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
