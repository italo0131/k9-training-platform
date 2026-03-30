import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiUser } from "../../_auth"
import { BillingServiceError, cancelPlatformSubscription } from "@/lib/asaas-subscription-service"
import { rejectIfCrossOrigin, rejectIfRateLimited } from "@/lib/security"

export async function POST(req: Request) {
  const crossOriginError = rejectIfCrossOrigin(req)
  if (crossOriginError) return crossOriginError

  const rateLimitError = rejectIfRateLimited(
    req,
    "billing-plan",
    15,
    10 * 60 * 1000,
    "Muitas alteracoes de plano em pouco tempo. Aguarde alguns minutos."
  )
  if (rateLimitError) return rateLimitError

  const { session, error } = await requireApiUser()
  if (error) return error

  try {
    const body = await req.json()
    const plan = String(body?.plan || "").toUpperCase()

    if (plan !== "FREE") {
      return NextResponse.json({ success: false, message: "Somente o plano free pode ser ativado diretamente" }, { status: 400 })
    }

    await cancelPlatformSubscription({ userId: session.user.id! })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: {
        id: true,
        plan: true,
        planStatus: true,
        planActivatedAt: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    if (error instanceof BillingServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }

    console.error("ERRO POST /api/billing/plan:", error)
    return NextResponse.json({ success: false, message: "Erro ao atualizar plano" }, { status: 500 })
  }
}
