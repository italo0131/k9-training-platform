import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiUser } from "../../../../_auth"
import { BillingServiceError, cancelChannelCheckoutOrSubscription, createChannelCheckout } from "@/lib/asaas-subscription-service"
import { isStaffRole } from "@/lib/role"
import { hasPremiumPlatformAccess } from "@/lib/platform"
import { getBillingProviderLabel } from "@/lib/billing-provider"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { session, error } = await requireApiUser()
  if (error) return error

  if (!hasPremiumPlatformAccess(session.user.plan, session.user.role, session.user.planStatus, session.user.status)) {
    return NextResponse.json({ success: false, message: "Assinaturas de canal fazem parte dos planos pagos" }, { status: 403 })
  }

  const { channelId } = await params

  const channel = await prisma.forumChannel.findUnique({
    where: { id: channelId },
    select: { id: true, slug: true, ownerId: true, isPublic: true, subscriptionPrice: true },
  })

  if (!channel?.id || !channel.isPublic) {
    return NextResponse.json({ success: false, message: "Canal nao encontrado" }, { status: 404 })
  }

  if (channel.ownerId === session.user.id) {
    return NextResponse.json({ success: false, message: "Voce ja e o dono deste canal" }, { status: 400 })
  }

  const existing = await prisma.channelSubscription.findUnique({
    where: {
      channelId_userId: {
        channelId: channel.id,
        userId: session.user.id!,
      },
    },
  })

  if ((channel.subscriptionPrice || 0) > 0) {
    try {
      const checkout = await createChannelCheckout({
        userId: session.user.id!,
        channelId: channel.id,
      })

      const subscription = await prisma.channelSubscription.findUnique({
        where: {
          channelId_userId: {
            channelId: channel.id,
            userId: session.user.id!,
          },
        },
      })

      return NextResponse.json({
        success: true,
        subscription,
        mode: "CHECKOUT_PENDING",
        url: checkout.url,
        nextUrl: `/forum/channels/${channel.slug}/assinar`,
        message: `Checkout criado com ${getBillingProviderLabel()}. Finalize o pagamento para liberar o acesso.`,
      })
    } catch (error) {
      if (error instanceof BillingServiceError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status })
      }

      console.error("ERRO POST /api/forum/channels/[channelId]/subscription:", error)
      return NextResponse.json({ success: false, message: "Nao foi possivel preparar a assinatura deste canal." }, { status: 500 })
    }
  }

  const subscription = existing
    ? await prisma.channelSubscription.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          tier: isStaffRole(session.user.role) ? "PARTNER" : "FREE",
          endedAt: null,
        },
      })
    : await prisma.channelSubscription.create({
        data: {
          channelId: channel.id,
          userId: session.user.id!,
          status: "ACTIVE",
          tier: isStaffRole(session.user.role) ? "PARTNER" : "FREE",
        },
      })

  return NextResponse.json({ success: true, subscription, mode: "ACTIVE", message: "Canal conectado a sua area de conteudo." })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { session, error } = await requireApiUser()
  if (error) return error

  if (!hasPremiumPlatformAccess(session.user.plan, session.user.role, session.user.planStatus, session.user.status)) {
    return NextResponse.json({ success: false, message: "Assinaturas de canal fazem parte dos planos pagos" }, { status: 403 })
  }

  const { channelId } = await params
  const existing = await prisma.channelSubscription.findUnique({
    where: {
      channelId_userId: {
        channelId,
        userId: session.user.id!,
      },
    },
  })

  try {
    const subscription = await cancelChannelCheckoutOrSubscription({
      userId: session.user.id!,
      channelId,
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: existingChannelMessage(existing?.status) ? "Pedido de assinatura cancelado." : "Assinatura removida do seu perfil.",
    })
  } catch (error) {
    if (error instanceof BillingServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }

    console.error("ERRO DELETE /api/forum/channels/[channelId]/subscription:", error)
    return NextResponse.json({ success: false, message: "Nao foi possivel cancelar a assinatura." }, { status: 500 })
  }
}

function existingChannelMessage(status?: string | null) {
  const normalized = String(status || "").toUpperCase()
  return normalized === "PENDING_PAYMENT" || normalized === "CHECKOUT_PENDING"
}
