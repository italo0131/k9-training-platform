import { NextResponse } from "next/server"

import { requireApiUser } from "@/app/api/_auth"
import { createPlatformCheckout, BillingServiceError } from "@/lib/asaas-subscription-service"
import { rejectIfCrossOrigin, rejectIfRateLimited } from "@/lib/security"

export async function POST(req: Request) {
  const crossOriginError = rejectIfCrossOrigin(req)
  if (crossOriginError) return crossOriginError

  const rateLimitError = rejectIfRateLimited(
    req,
    "asaas-platform-checkout",
    10,
    10 * 60 * 1000,
    "Muitas tentativas de checkout em pouco tempo. Aguarde alguns minutos e tente novamente."
  )
  if (rateLimitError) return rateLimitError

  const { session, error } = await requireApiUser()
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const checkout = await createPlatformCheckout({
      userId: session.user.id!,
      requestedPlanCode: String(body?.plan || "STANDARD_MONTHLY"),
    })

    return NextResponse.json({
      success: true,
      url: checkout.url,
      plan: checkout.plan.code,
      subscriptionId: checkout.subscriptionId,
    })
  } catch (error) {
    if (error instanceof BillingServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }

    console.error("ERRO POST /api/subscription/create-checkout:", error)
    return NextResponse.json({ success: false, message: "Erro ao iniciar checkout do plano Standard." }, { status: 500 })
  }
}
