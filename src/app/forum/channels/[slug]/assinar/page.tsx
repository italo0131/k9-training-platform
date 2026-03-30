import Link from "next/link"
import { redirect } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { getBillingProviderLabel } from "@/lib/billing-provider"
import { formatMoney } from "@/lib/community"
import { prisma } from "@/lib/prisma"
import {
  getChannelSubscriptionStatusLabel,
  hasPremiumPlatformAccess,
  isChannelSubscriptionActive,
  isChannelSubscriptionPending,
} from "@/lib/platform"
import { getRoleLabel } from "@/lib/role"

import PaidChannelCheckoutCard from "../PaidChannelCheckoutCard"

export default async function ChannelSubscriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ status?: string }>
}) {
  const { slug } = await params
  const resolvedSearchParams = (await searchParams) || {}
  const session = await requireUser()

  const channel = await prisma.forumChannel.findUnique({
    where: { slug },
    include: {
      owner: true,
      _count: { select: { contents: true, threads: true, subscriptions: true } },
    },
  })

  if (!channel) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center text-white">
        <p>Canal nao encontrado.</p>
      </div>
    )
  }

  if (channel.ownerId === session.user.id) {
    redirect(`/forum/channels/${channel.slug}`)
  }

  if ((channel.subscriptionPrice || 0) <= 0) {
    redirect(`/forum/channels/${channel.slug}`)
  }

  const viewerSubscription = await prisma.channelSubscription.findUnique({
    where: {
      channelId_userId: {
        channelId: channel.id,
        userId: session.user.id!,
      },
    },
  })

  const hasPremiumAccess = hasPremiumPlatformAccess(session.user.plan, session.user.role, session.user.planStatus, session.user.status)
  const providerLabel = getBillingProviderLabel()
  const viewerStatus = viewerSubscription?.status || null
  const isActive = isChannelSubscriptionActive(viewerStatus)
  const isPending = isChannelSubscriptionPending(viewerStatus)
  const checkoutStatus = String(resolvedSearchParams.status || "").toLowerCase()

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.16),transparent_25%),linear-gradient(145deg,#020617,#0f172a_55%,#020617)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href={`/forum/channels/${channel.slug}`} className="text-cyan-300 hover:underline underline-offset-4">
          Voltar ao canal
        </Link>

        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(88,28,135,0.32),rgba(15,23,42,0.88)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_32%)] p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-200/80">Canal com assinatura</p>
              <h1 className="text-3xl font-semibold md:text-4xl">Assinar {channel.name}</h1>
              <p className="text-slate-300">
                Revise o valor mensal, entenda o que entra na assinatura e acompanhe o status comercial deste canal antes da liberacao completa.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1 text-gray-100">{channel.owner.name}</span>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-cyan-100">{getRoleLabel(channel.owner.role)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-gray-100">{formatMoney(channel.subscriptionPrice) || "Sem preco"}/mes</span>
                {viewerStatus ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-gray-100">{getChannelSubscriptionStatusLabel(viewerStatus)}</span>
                ) : null}
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-slate-950/35 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Entrega do canal</p>
              <p className="mt-2 text-lg font-semibold">{channel._count.contents} modulos e {channel._count.threads} posts</p>
              <p className="mt-2 text-sm text-slate-300">{channel._count.subscriptions} assinantes ativos</p>
            </div>
          </div>
        </section>

        {checkoutStatus === "success" ? (
          <div className="rounded-[26px] border border-emerald-300/20 bg-emerald-500/10 p-5 text-sm text-emerald-50">
            Pagamento enviado. Estamos confirmando a liberacao do canal com o {providerLabel}.
          </div>
        ) : null}

        {checkoutStatus === "cancel" ? (
          <div className="rounded-[26px] border border-amber-300/20 bg-amber-500/10 p-5 text-sm text-amber-50">
            O checkout foi interrompido. Sua solicitacao continua salva e voce pode retomar quando quiser.
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">O que voce esta assinando</p>
              <h2 className="mt-3 text-2xl font-semibold">Canal com assinatura propria</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{channel.description}</p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <StepCard
                  title="1. Plano da plataforma"
                  description={
                    hasPremiumAccess
                      ? "Sua conta ja pode seguir para a etapa comercial do canal."
                      : "Primeiro libere o plano Standard ou acesso profissional aprovado."
                  }
                  tone={hasPremiumAccess ? "ready" : "warning"}
                />
                <StepCard
                  title="2. Assinatura do canal"
                  description="Cada profissional pode ter seu proprio valor mensal e politica comercial."
                  tone="default"
                />
                <StepCard
                  title={`3. Cobranca via ${providerLabel}`}
                  description="Ao seguir, voce abre o checkout real e o acesso e liberado depois da confirmacao financeira."
                  tone="default"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Status atual</p>
              <h2 className="mt-3 text-2xl font-semibold">
                {isActive ? "Acesso liberado" : isPending ? "Aguardando confirmacao financeira" : "Pronto para iniciar"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {isActive
                  ? "Sua conta ja esta com acesso ativo a este canal."
                  : isPending
                    ? "Seu pedido foi criado e agora a cobranca precisa ser confirmada antes da liberacao final."
                    : "Ainda nao existe uma assinatura vinculada a este canal na sua conta."}
              </p>
            </div>
          </div>

          <PaidChannelCheckoutCard
            channelId={channel.id}
            channelSlug={channel.slug}
            initialStatus={viewerStatus}
            hasPremiumAccess={hasPremiumAccess}
            upgradeHref={`/billing?locked=/forum/channels/${channel.slug}/assinar`}
            providerLabel={providerLabel}
          />
        </section>
      </div>
    </div>
  )
}

function StepCard({
  title,
  description,
  tone,
}: {
  title: string
  description: string
  tone: "default" | "ready" | "warning"
}) {
  const toneClass =
    tone === "ready"
      ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-50"
      : tone === "warning"
        ? "border-amber-300/20 bg-amber-500/10 text-amber-50"
        : "border-white/10 bg-white/5 text-slate-200"

  return (
    <div className={`rounded-[24px] border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-3 text-sm leading-6">{description}</p>
    </div>
  )
}
