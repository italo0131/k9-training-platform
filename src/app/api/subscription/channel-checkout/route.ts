import { NextResponse } from "next/server"

import { requireApiUser } from "@/app/api/_auth"
import { createChannelCheckout, BillingServiceError } from "@/lib/asaas-subscription-service"
import { hasPremiumPlatformAccess } from "@/lib/platform"
import { rejectIfCrossOrigin, rejectIfRateLimited } from "@/lib/security"

export async function POST(req: Request) {
  const crossOriginError = rejectIfCrossOrigin(req)
  if (crossOriginError) return crossOriginError

  const rateLimitError = rejectIfRateLimited(
    req,
    "asaas-channel-checkout",
    12,
    10 * 60 * 1000,
    "Muitas tentativas de assinatura em pouco tempo. Aguarde alguns minutos."
  )
  if (rateLimitError) return rateLimitError

  const { session, error } = await requireApiUser()
  if (error) return error

  if (!hasPremiumPlatformAccess(session.user.plan, session.user.role, session.user.planStatus, session.user.status)) {
    return NextResponse.json(
      { success: false, message: "Assinaturas de canal fazem parte do plano Standard ou do acesso profissional aprovado." },
      { status: 403 }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const channelId = String(body?.channelId || "").trim()

    if (!channelId) {
      return NextResponse.json({ success: false, message: "Informe o canal que deseja assinar." }, { status: 400 })
    }

    const checkout = await createChannelCheckout({
      userId: session.user.id!,
      channelId,
    })

    return NextResponse.json({
      success: true,
      url: checkout.url,
      channelSlug: checkout.channel.slug,
      subscriptionId: checkout.subscriptionId,
    })
  } catch (error) {
    if (error instanceof BillingServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }

    console.error("ERRO POST /api/subscription/channel-checkout:", error)
    return NextResponse.json({ success: false, message: "Erro ao iniciar checkout do canal." }, { status: 500 })
  }
}
