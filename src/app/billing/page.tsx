import Link from "next/link"
import type { ReactNode } from "react"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"
import BillingClient from "./BillingClient"
import {
  getAccountPlanDescription,
  getAccountPlanLabel,
  getPlanUpgradeReason,
  getPlanStatusLabel,
} from "@/lib/platform"
import { isAsaasConfigured } from "@/lib/asaas"
import { getBillingProvider, getBillingProviderLabel, isStripeBillingProvider } from "@/lib/billing-provider"
import { findPlatformBillingPlan, PLATFORM_BILLING_PLANS, resolveActiveBillingPlanCode } from "@/lib/subscription-plans"

function getStripePriceIdForPlan(planCode: string) {
  if (planCode === "STANDARD_MONTHLY" || planCode === "STANDARD") {
    return process.env.STRIPE_PRICE_ID_STANDARD || process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_ID || null
  }

  return null
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: { locked?: string; status?: string; plan?: string }
}) {
  const session = await requireUser()
  const lockedPath = searchParams?.locked || ""
  const checkoutStatus = String(searchParams?.status || "").toLowerCase()
  const checkoutPlan = String(searchParams?.plan || "").toUpperCase()
  const billingProvider = getBillingProvider()
  const billingProviderLabel = getBillingProviderLabel(billingProvider)

  const [payments, user, dogCount] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        planStatus: true,
        planActivatedAt: true,
        emailVerifiedAt: true,
      },
    }),
    prisma.dog.count({ where: { ownerId: session.user.id } }),
  ])

  const plans = PLATFORM_BILLING_PLANS.map((plan) => ({
    code: plan.code,
    name: plan.name,
    price: plan.priceLabel,
    description: plan.description,
    perks: [...plan.perks],
    priceId: isStripeBillingProvider(billingProvider) ? getStripePriceIdForPlan(plan.code) : null,
    highlight: plan.code === "STANDARD_MONTHLY",
  }))

  const currentPlan = String(user?.plan || "FREE").toUpperCase()
  const currentStatus = String(user?.planStatus || "ACTIVE").toUpperCase()
  const currentBillingPlan = resolveActiveBillingPlanCode(currentPlan)
  const hasCheckoutConfig = isStripeBillingProvider(billingProvider)
    ? plans.some((plan) => plan.code !== "FREE" && !!plan.priceId)
    : isAsaasConfigured()
  const lastPayment = payments[0]
  const nextStep = !user?.emailVerifiedAt
    ? "Confirme seu email para proteger a conta."
    : currentPlan === "FREE"
      ? "Escolha um plano pago quando quiser liberar tudo."
      : currentStatus === "ACTIVE"
        ? "Sua assinatura esta pronta para uso."
        : "Conclua o checkout para liberar o plano escolhido."

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_24%),linear-gradient(145deg,#020617,#0f172a_55%,#020617)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,rgba(8,145,178,0.12),rgba(255,255,255,0.03))] p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Assinatura</p>
              <h1 className="text-3xl font-semibold md:text-4xl">Escolha o nivel de acesso da sua conta.</h1>
              <p className="max-w-2xl text-slate-300">
                Free libera blog, racas e ate 3 caes. Standard libera a experiencia completa da plataforma e a operacao profissional aprovada ganha acesso proprio.
              </p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-slate-950/35 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Plano atual</p>
              <p className="mt-2 text-2xl font-semibold">{getAccountPlanLabel(currentPlan)}</p>
              <p className="mt-2 text-sm text-slate-300">{getPlanStatusLabel(currentStatus)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatusTile title="Acesso atual" value={getAccountPlanLabel(currentPlan)} description={getAccountPlanDescription(currentPlan)} />
            <StatusTile title="Proximo passo" value={nextStep} description={user?.emailVerifiedAt ? "Conta protegida e pronta para seguir." : "Sem email confirmado, vale concluir essa etapa primeiro."} />
            <StatusTile
              title="Gateway"
              value={hasCheckoutConfig ? `${billingProviderLabel} pronto` : `${billingProviderLabel} em preparo`}
              description={
                hasCheckoutConfig
                  ? "Os planos pagos ja podem abrir checkout."
                  : billingProvider === "ASAAS"
                    ? "Falta configurar a chave e o webhook do Asaas para liberar a cobranca real."
                    : "Faltando configurar o checkout real dos planos pagos."
              }
            />
          </div>
        </section>

        {checkoutStatus === "success" ? (
          <Notice tone="success">
            Pagamento enviado. Estamos confirmando a assinatura do plano <strong>{findPlatformBillingPlan(checkoutPlan || currentBillingPlan).name}</strong>.
          </Notice>
        ) : null}

        {checkoutStatus === "cancel" ? (
          <Notice tone="warning">
            O checkout foi interrompido. Sua conta continua salva e voce pode retomar a assinatura quando quiser.
          </Notice>
        ) : null}

        {currentStatus === "CHECKOUT_REQUIRED" || currentStatus === "CHECKOUT_PENDING" ? (
          <Notice tone="warning">
            Sua conta ja esta vinculada ao plano <strong>{findPlatformBillingPlan(currentBillingPlan).name}</strong>, mas a assinatura ainda nao foi concluida.
          </Notice>
        ) : null}

        {lockedPath ? (
          <Notice tone="info">
            <strong>Upgrade necessario:</strong> {getPlanUpgradeReason(lockedPath)}
          </Notice>
        ) : null}

        {!user?.emailVerifiedAt ? (
          <Notice tone="info">
            Confirme o email antes de depender da sua assinatura no dia a dia. Isso evita bloqueios e protege o acesso da conta.
          </Notice>
        ) : null}

        <OnboardingNextStep
          emailVerified={!!user?.emailVerifiedAt}
          currentPlan={currentPlan}
          currentStatus={currentStatus}
          dogCount={dogCount}
        />

        {lastPayment ? (
          <div className="rounded-[26px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
            Ultimo evento financeiro: <strong className="text-white">{lastPayment.type}</strong> em{" "}
            {new Date(lastPayment.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}.
          </div>
        ) : null}

        <div id="billing-plans">
          <BillingClient plans={plans} currentPlan={currentBillingPlan} planStatus={currentStatus} providerLabel={billingProviderLabel} provider={billingProvider} />
        </div>
      </div>
    </div>
  )
}

function StatusTile({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  )
}

function Notice({
  children,
  tone,
}: {
  children: ReactNode
  tone: "success" | "warning" | "info"
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-50"
      : tone === "warning"
        ? "border-amber-300/20 bg-amber-500/10 text-amber-50"
        : "border-cyan-300/20 bg-cyan-500/10 text-cyan-50"

  return <div className={`rounded-[26px] border p-5 text-sm leading-7 ${toneClass}`}>{children}</div>
}

function OnboardingNextStep({
  emailVerified,
  currentPlan,
  currentStatus,
  dogCount,
}: {
  emailVerified: boolean
  currentPlan: string
  currentStatus: string
  dogCount: number
}) {
  let href = "/dashboard"
  let label = "Voltar ao dashboard"
  let title = "Sua conta ja esta pronta para seguir"
  let description = "Com a assinatura organizada, voce pode voltar ao painel e continuar usando a plataforma."

  if (!emailVerified) {
    href = `/verify?next=billing&plan=${currentPlan}`
    label = "Confirmar minha conta"
    title = "Proteja a conta antes de depender da assinatura"
    description = "Sem email confirmado, vale concluir essa etapa antes de usar o plano no dia a dia."
  } else if (currentPlan !== "FREE" && currentStatus !== "ACTIVE") {
    href = "#billing-plans"
    label = `Ativar ${getAccountPlanLabel(currentPlan)}`
    title = "Concluir assinatura"
    description = "Seu plano ja esta escolhido. Falta so fechar o checkout para liberar todo o acesso."
  } else if (dogCount === 0) {
    href = "/dogs/new"
    label = "Cadastrar primeiro cao"
    title = "Hora de montar sua base real"
    description = "Com o primeiro cao cadastrado, a plataforma consegue personalizar treino, rotina e conteudo."
  }

  return (
    <section className="rounded-[28px] border border-emerald-300/15 bg-emerald-500/10 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Continuar jornada</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-50/90">{description}</p>
      <Link
        href={href}
        className="interactive-button mt-5 inline-flex rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#10b981)] px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20"
      >
        {label}
      </Link>
    </section>
  )
}
