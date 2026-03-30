import Link from "next/link"
import { redirect } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDateRange, formatMoney, formatRegion, formatServiceMode } from "@/lib/community"
import {
  calculatePlatformCommission,
  calculateProfessionalNet,
  isOpenTransactionStatus,
  isSettledTransactionStatus,
  PLATFORM_COMMISSION_RATE,
  summarizeProfessionalCatalog,
  summarizeTransactionLedger,
} from "@/lib/professional-finance"
import { getAccountPlanLabel, getPlanStatusLabel } from "@/lib/platform"
import { getRoleLabel, isProfessionalRole, isVetRole, needsProfessionalApproval } from "@/lib/role"

export default async function FinanceiroPage() {
  const session = await requireUser()

  if (!isProfessionalRole(session.user.role)) {
    redirect("/dashboard")
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const isVet = isVetRole(session.user.role)

  const [me, ownedChannels, schedulesThisMonth, upcomingSchedules, monthlyTransactions, openTransactions, recentTransactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        role: true,
        plan: true,
        planStatus: true,
        status: true,
        emailVerifiedAt: true,
        city: true,
        state: true,
      },
    }),
    prisma.forumChannel.findMany({
      where: { ownerId: session.user.id },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
              },
            },
          },
        },
        _count: { select: { contents: true, threads: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.schedule.findMany({
      where: {
        trainerId: session.user.id,
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      orderBy: { date: "asc" },
      include: { user: true, dog: true },
    }),
    prisma.schedule.findMany({
      where: {
        trainerId: session.user.id,
        date: { gte: now },
      },
      orderBy: { date: "asc" },
      include: { user: true, dog: true },
      take: 8,
    }),
    prisma.transaction.findMany({
      where: {
        channel: { ownerId: session.user.id },
        subscription: { planType: "CHANNEL" },
        createdAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      select: {
        status: true,
        grossAmount: true,
        feeAmount: true,
        netAmount: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        channel: { ownerId: session.user.id },
        subscription: { planType: "CHANNEL" },
        status: { in: ["PENDING", "OVERDUE", "CHECKOUT_PENDING"] },
      },
      select: {
        status: true,
        grossAmount: true,
        feeAmount: true,
        netAmount: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        channel: { ownerId: session.user.id },
        subscription: { planType: "CHANNEL" },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ])

  if (!me) {
    redirect("/dashboard")
  }

  const finance = summarizeProfessionalCatalog(ownedChannels)
  const settledMonthLedger = summarizeTransactionLedger(monthlyTransactions.filter((transaction) => isSettledTransactionStatus(transaction.status)))
  const openLedger = summarizeTransactionLedger(openTransactions.filter((transaction) => isOpenTransactionStatus(transaction.status)))
  const overdueAmount = openTransactions
    .filter((transaction) => String(transaction.status || "").toUpperCase() === "OVERDUE")
    .reduce((sum, transaction) => sum + (transaction.grossAmount || 0), 0)
  const pendingApproval = needsProfessionalApproval(me.role, me.status)
  const monthLabel = monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  const onlineSchedules = schedulesThisMonth.filter((item) => item.format === "ONLINE").length
  const inPersonSchedules = schedulesThisMonth.filter((item) => item.format === "PRESENTIAL").length
  const hybridSchedules = schedulesThisMonth.filter((item) => item.format === "HYBRID").length
  const totalProjectedServicePipeline = calculateProfessionalNet(
    (finance.averageOnlinePrice || 0) * onlineSchedules +
      (finance.averageInPersonPrice || 0) * inPersonSchedules +
      Math.round(((finance.averageOnlinePrice || 0) + (finance.averageInPersonPrice || 0)) / 2) * hybridSchedules
  )

  const introTitle = isVet ? "Financeiro clinico e recorrencia da sua base." : "Financeiro da sua operacao de treino."
  const introCopy = isVet
    ? "Acompanhe canais pagos, previsao de repasse, volume de consultas e o ritmo comercial da sua carteira clinica dentro da K9."
    : "Acompanhe canais pagos, previsao de repasse, agenda ativa e o ritmo comercial da sua carteira de adestramento dentro da K9."
  const pipelineLabel = isVet ? "Pipeline clinico do mes" : "Pipeline de atendimentos do mes"
  const serviceLabel = isVet ? "consulta" : "sessao"

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.13),transparent_24%),linear-gradient(145deg,#020617,#0f172a_55%,#020617)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,23,42,0.74)),radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_32%)] p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Financeiro profissional</p>
              <h1 className="text-3xl font-semibold md:text-4xl">{introTitle}</h1>
              <p className="max-w-2xl text-slate-300">{introCopy}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1 text-gray-100">{getRoleLabel(me.role)}</span>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-cyan-100">{getAccountPlanLabel(me.plan)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-gray-100">{getPlanStatusLabel(me.planStatus)}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-gray-100">{formatRegion(me.city, me.state)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-gray-100 transition hover:bg-white/10"
              >
                Voltar ao painel
              </Link>
              <Link
                href="/forum/channels/new"
                className="rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#10b981)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20"
              >
                Novo canal ou servico
              </Link>
            </div>
          </div>

          {pendingApproval ? (
            <div className="mt-6 rounded-[24px] border border-amber-300/20 bg-amber-500/10 p-5 text-sm text-amber-50">
              Seu perfil profissional ainda esta em analise. Esta area ja mostra sua estrutura, mas a operacao comercial so fica completa depois da aprovacao.
            </div>
          ) : null}

          {!me.emailVerifiedAt ? (
            <div className="mt-4 rounded-[24px] border border-cyan-300/20 bg-cyan-500/10 p-5 text-sm text-cyan-50">
              Confirme seu email para reforcar confianca comercial e evitar travas de operacao.
              <Link href="/verify" className="ml-2 underline underline-offset-4">
                Confirmar agora
              </Link>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <FinanceStat title="Receita recorrente potencial" value={formatMoney(finance.recurringGross) || "R$ 0"} description="Soma mensal dos canais pagos ativos" accent />
            <FinanceStat title="Recebido no mes" value={formatMoney(settledMonthLedger.gross) || "R$ 0"} description="Pagamentos confirmados via Asaas" />
            <FinanceStat title="Repasse confirmado" value={formatMoney(settledMonthLedger.net) || "R$ 0"} description="Valor liquido ja conciliado" />
            <FinanceStat title="Assinantes ativos" value={finance.activeSubscribers} description="Clientes recorrentes dentro da K9" />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <FinanceStat
              title="Comissao retida no mes"
              value={formatMoney(settledMonthLedger.fee) || "R$ 0"}
              description={`Taxa de ${(PLATFORM_COMMISSION_RATE * 100).toFixed(0)}% sobre pagamentos liquidados`}
              compact
            />
            <FinanceStat title="Receita em aberto" value={formatMoney(openLedger.gross) || "R$ 0"} description="Cobrancas pendentes ou ainda em analise" compact />
            <FinanceStat title="Pagamentos em atraso" value={formatMoney(overdueAmount) || "R$ 0"} description="Assinaturas com risco de churn ou atraso" compact />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Canais e assinaturas</p>
                <h2 className="text-2xl font-semibold">Motor recorrente da sua receita</h2>
              </div>
              <span className="text-sm text-slate-400">{ownedChannels.length} canais</span>
            </div>

            <div className="space-y-3">
              {ownedChannels.map((channel) => {
                const subscribers = channel.subscriptions.length
                const gross = (channel.subscriptionPrice || 0) * subscribers
                const commission = calculatePlatformCommission(gross)
                const net = calculateProfessionalNet(gross)

                return (
                  <Link
                    key={channel.id}
                    href={`/forum/channels/${channel.slug}`}
                    className="block rounded-[24px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{channel.name}</p>
                        <p className="mt-2 text-sm text-slate-300">{channel.description}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-100">
                        {formatMoney(channel.subscriptionPrice) || "Canal gratuito"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <ChannelMetric label="Assinantes" value={subscribers} />
                      <ChannelMetric label="Bruto mensal" value={formatMoney(gross) || "R$ 0"} />
                      <ChannelMetric label="Comissao" value={formatMoney(commission) || "R$ 0"} />
                      <ChannelMetric label="Liquido" value={formatMoney(net) || "R$ 0"} />
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      {channel._count.contents} modulos • {channel._count.threads} posts • {formatServiceMode(channel.serviceMode)}
                    </p>
                  </Link>
                )
              })}

              {ownedChannels.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300">
                  Seu lado comercial comeca no canal. Crie seu espaco para assinar clientes, publicar conteudo e montar sua prateleira de servicos.
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">{pipelineLabel}</p>
                  <h2 className="text-2xl font-semibold">{monthLabel}</h2>
                </div>
                <span className="text-sm text-slate-400">{schedulesThisMonth.length} agendamentos</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FinanceStat title={`Online (${serviceLabel}s)`} value={onlineSchedules} description="Volume do mes" compact />
                <FinanceStat title={`Presencial (${serviceLabel}s)`} value={inPersonSchedules} description="Volume do mes" compact />
                <FinanceStat title="Hibrido" value={hybridSchedules} description="Volume do mes" compact />
                <FinanceStat
                  title="Pipeline liquido"
                  value={formatMoney(totalProjectedServicePipeline) || "R$ 0"}
                  description="Estimativa baseada nos tickets configurados"
                  compact
                />
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Como o agendamento pago ainda vai entrar na proxima fase, esta leitura mostra o volume real da agenda e uma projeção baseada nos tickets configurados do seu catalogo.
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Tickets configurados</p>
                  <h2 className="text-2xl font-semibold">Prateleira comercial</h2>
                </div>
                <Link href="/forum/channels/new" className="text-sm text-cyan-300 hover:underline underline-offset-4">
                  Ajustar canais
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FinanceStat title="Canais pagos" value={finance.paidChannelsCount} description="Com recorrencia ativa" compact />
                <FinanceStat title="Servicos online" value={finance.onlineServicesCount} description="Tickets configurados" compact />
                <FinanceStat
                  title="Ticket medio online"
                  value={formatMoney(finance.averageOnlinePrice) || "Nao definido"}
                  description="Media dos canais com online"
                  compact
                />
                <FinanceStat
                  title="Ticket medio presencial"
                  value={formatMoney(finance.averageInPersonPrice) || "Nao definido"}
                  description="Media dos canais com presencial"
                  compact
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Transacoes recentes</p>
                <h2 className="text-2xl font-semibold">Conciliacao comercial do canal</h2>
              </div>
              <span className="text-sm text-slate-400">{recentTransactions.length}</span>
            </div>

            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/forum/channels/${transaction.channel?.slug || ""}`}
                  className="block rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{transaction.user?.name || "Cliente"}</p>
                      <p className="mt-1 text-sm text-slate-300">{transaction.channel?.name || "Canal"}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{formatMoney(transaction.grossAmount) || "R$ 0"}</p>
                      <p>{transaction.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <p>{formatRegion(transaction.user?.city, transaction.user?.state)}</p>
                    <span className={`rounded-full px-3 py-1 ${getTransactionToneClass(transaction.status)}`}>
                      {getTransactionStatusLabel(transaction.status)}
                    </span>
                  </div>
                </Link>
              ))}

              {recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-300">Nenhuma transacao de canal registrada ainda.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Agenda futura</p>
                <h2 className="text-2xl font-semibold">Proximos atendimentos</h2>
              </div>
              <Link href="/calendar" className="text-sm text-cyan-300 hover:underline underline-offset-4">
                Abrir agenda
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSchedules.map((item) => (
                <Link
                  key={item.id}
                  href="/calendar"
                  className="block rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">{item.title}</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-100">{item.format}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {formatDateRange(item.date, item.durationMinutes ? new Date(item.date.getTime() + item.durationMinutes * 60000) : null)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.user?.name || "Tutor"} • {item.dog?.name || "Sem cao"}
                  </p>
                </Link>
              ))}

              {upcomingSchedules.length === 0 ? (
                <p className="text-sm text-slate-300">Nenhum atendimento futuro registrado.</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Operacao financeira</p>
              <h2 className="mt-2 text-2xl font-semibold">Receita real e projecao da operacao</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                Esta area agora combina transacoes reais dos canais com a leitura de projeção do seu catalogo. Os agendamentos pagos continuam na proxima fase, mas a recorrencia dos canais ja entra na conciliacao.
              </p>
            </div>
            <Link
              href="/profile/edit"
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-gray-100 transition hover:bg-white/10"
            >
              Ajustar posicionamento comercial
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function FinanceStat({
  title,
  value,
  description,
  accent = false,
  compact = false,
}: {
  title: string
  value: string | number
  description: string
  accent?: boolean
  compact?: boolean
}) {
  return (
    <div className={`rounded-[24px] border border-white/10 bg-white/5 ${compact ? "p-4" : "p-5"}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className={`mt-3 font-semibold text-white ${compact ? "text-xl" : "text-2xl"} ${accent ? "text-emerald-200" : ""}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  )
}

function ChannelMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-950/35 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function getTransactionStatusLabel(status?: string | null) {
  const value = String(status || "").toUpperCase()
  if (value === "RECEIVED" || value === "CONFIRMED" || value === "PAID") return "Recebido"
  if (value === "OVERDUE") return "Em atraso"
  if (value === "PENDING" || value === "CHECKOUT_PENDING") return "Pendente"
  if (value === "CANCELED") return "Cancelado"
  if (value === "REFUNDED") return "Estornado"
  return value || "Sem status"
}

function getTransactionToneClass(status?: string | null) {
  const value = String(status || "").toUpperCase()
  if (value === "RECEIVED" || value === "CONFIRMED" || value === "PAID") {
    return "bg-emerald-500/15 text-emerald-100"
  }
  if (value === "OVERDUE") {
    return "bg-amber-500/15 text-amber-100"
  }
  if (value === "CANCELED" || value === "REFUNDED") {
    return "bg-rose-500/15 text-rose-100"
  }
  return "bg-white/10 text-gray-100"
}
