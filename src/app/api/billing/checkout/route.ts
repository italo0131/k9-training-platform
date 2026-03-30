import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"
import { NextResponse } from "next/server"
import { requireApiUser } from "../../_auth"
import { getBillingProvider, isStripeBillingProvider } from "@/lib/billing-provider"
import { createPlatformCheckout, BillingServiceError } from "@/lib/asaas-subscription-service"
import { rejectIfCrossOrigin, rejectIfRateLimited } from "@/lib/security"
import { normalizeAccountPlan } from "@/lib/platform"
import { findPlatformBillingPlan } from "@/lib/subscription-plans"

export async function POST(req: Request) {
  const crossOriginError = rejectIfCrossOrigin(req)
  if (crossOriginError) return crossOriginError

  const rateLimitError = rejectIfRateLimited(
    req,
    "billing-checkout",
    12,
    10 * 60 * 1000,
    "Muitas tentativas de checkout em pouco tempo. Aguarde alguns minutos e tente novamente."
  )
  if (rateLimitError) return rateLimitError

  try {
    const { session: authSession, error } = await requireApiUser()
    if (error) return error

    const body = await req.json()
    const billingProvider = getBillingProvider()

    if (!isStripeBillingProvider(billingProvider)) {
      const checkout = await createPlatformCheckout({
        userId: authSession.user.id!,
        requestedPlanCode: String(body.plan || "STANDARD_MONTHLY"),
      })

      return NextResponse.json({ success: true, url: checkout.url, plan: checkout.plan.code })
    }

    if (!stripe) {
      return NextResponse.json({ success: false, message: "Stripe nao configurado" }, { status: 500 })
    }

    const rawRequestedPlan = String(body.plan || "STANDARD_MONTHLY").toUpperCase()
    const billingPlan = findPlatformBillingPlan(rawRequestedPlan)
    const requestedPlan = billingPlan.accessPlan
    const fallbackPriceId = process.env.STRIPE_PRICE_ID_STANDARD || process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_ID || ""
    const priceId = String(body.priceId || fallbackPriceId || "").trim()

    if (requestedPlan !== "STANDARD") {
      return NextResponse.json({ success: false, message: "Escolha um plano pago valido para iniciar a assinatura." }, { status: 400 })
    }

    if (!priceId) {
      return NextResponse.json({ success: false, message: "O plano escolhido ainda nao foi configurado no Stripe." }, { status: 400 })
    }

    const userId = authSession.user.id!
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planStatus: true },
    })
    const hasActivePaidPlan =
      !!currentUser &&
      normalizeAccountPlan(currentUser.plan) !== "FREE" &&
      String(currentUser.planStatus || "ACTIVE").toUpperCase() === "ACTIVE"
    const isPlanSwitch = normalizeAccountPlan(currentUser?.plan) !== requestedPlan
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const successUrl = new URL(process.env.STRIPE_SUCCESS_URL || `${baseUrl}/billing`)
    successUrl.searchParams.set("status", "success")
    successUrl.searchParams.set("plan", rawRequestedPlan)

    const cancelUrl = new URL(process.env.STRIPE_CANCEL_URL || `${baseUrl}/billing`)
    cancelUrl.searchParams.set("status", "cancel")
    cancelUrl.searchParams.set("plan", rawRequestedPlan)

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: authSession.user.email ?? undefined,
      client_reference_id: userId,
      metadata: { userId, plan: requestedPlan },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    }

    if (!(hasActivePaidPlan && isPlanSwitch)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: requestedPlan,
          planStatus: "CHECKOUT_PENDING",
          planActivatedAt: null,
        },
      })
    }

    const session = await stripe.checkout.sessions.create(params)

    return NextResponse.json({ success: true, url: session.url })
  } catch (error) {
    if (error instanceof BillingServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }

    console.error("ERRO CHECKOUT STRIPE:", error)
    return NextResponse.json({ success: false, message: "Erro ao criar checkout" }, { status: 500 })
  }
}
