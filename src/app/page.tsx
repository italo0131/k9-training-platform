import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const [dogs, trainings, users, schedules] = await Promise.all([
    prisma.dog.count(),
    prisma.trainingSession.count(),
    prisma.user.count(),
    prisma.schedule.count(),
  ])

  const upcoming = await prisma.schedule.findMany({
    orderBy: { date: "asc" },
    take: 3,
    select: { id: true, date: true, status: true },
  })

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <section className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-4 sm:px-6 py-14 md:flex-row md:items-center md:gap-10 lg:gap-12">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200/80">
            Plataforma K9 • SaaS
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Treinos mais inteligentes, agenda profissional e assinaturas no mesmo painel.
          </h1>
          <p className="max-w-2xl text-lg text-gray-300/85">
            Organize caes, tutores e evolucao de treinos com visuais claros, calendario integrado e cobranca recorrente
            via Stripe. Tudo pronto para crescer com seu centro de treinamento.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
            >
              Criar conta
            </Link>
            <a
              href="#planos"
              className="rounded-xl border border-white/15 px-5 py-3 text-gray-100 hover:bg-white/10 transition"
            >
              Ver planos
            </a>
            <a
              href="#tour"
              className="rounded-xl border border-white/15 px-5 py-3 text-gray-100 hover:bg-white/10 transition"
            >
              Ver demo
            </a>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-cyan-200/80">
            <Link href="/register" className="hover:underline underline-offset-4">
              Acesso completo apos cadastro
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <Feature title="Progresso visual" desc="Barras e cards por cao e por treino." href="/register" />
            <Feature title="Agenda" desc="Calendario com aulas e status." href="/register" />
            <Feature title="Assinaturas" desc="Checkout Stripe para planos SaaS." href="/register" />
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl space-y-4">
            <p className="text-sm text-gray-300/80">Visao rapida</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Caes ativos" value={String(dogs)} href="/register" />
              <Stat label="Treinos" value={String(trainings)} href="/register" />
              <Stat label="Alunos" value={String(users)} href="/register" />
              <Stat label="Agendamentos" value={String(schedules)} href="/register" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-gray-300">Proximos treinos</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-200">
                {upcoming.length === 0 && <li>Nenhum agendamento por enquanto.</li>}
                {upcoming.map((item) => (
                  <li key={item.id}>
                    <Link href="/calendar" className="hover:text-cyan-200 transition">
                      {new Date(item.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      - {item.status}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/billing"
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
            >
              <p className="text-sm text-gray-300">Planos SaaS</p>
              <p className="text-xl font-semibold text-cyan-300">Starter R$79 • Pro R$149</p>
              <p className="text-gray-300 text-sm">Assine e desbloqueie tudo via Stripe.</p>
            </Link>
          </div>
        </div>
      </section>

      <section id="tour" className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">
                Plataforma
              </p>

              <h2 className="text-3xl font-semibold">
                Um painel criado para quem leva o treinamento a sério
              </h2>

              <p className="text-gray-300/80">
                Controle cães, clientes e sessões em um sistema rápido, intuitivo e profissional.
              </p>
            </div>
          <Link
            href="/register"
            className="rounded-xl border border-white/15 px-5 py-3 text-gray-100 hover:bg-white/10 transition"
          >
            Quero testar
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PhotoCard title="Controle de treinos" desc="Evolucao por sessao e por cao." accent="from-cyan-500/30" href="/register" />
          <PhotoCard title="Agenda profissional" desc="Aulas, horarios e status." accent="from-emerald-500/30" href="/register" />
          <PhotoCard title="SaaS & Billing" desc="Assinaturas e relatorios." accent="from-sky-500/30" href="/register" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Como funciona</p>
          <h2 className="text-3xl font-semibold mt-2">Tres passos para tudo ficar organizado</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Step number="01" title="Cadastre tutores e caes" desc="Crie o perfil completo e vincule o historico." href="/register" />
            <Step number="02" title="Registre treinos" desc="Anote progresso, metas e observacoes importantes." href="/register" />
            <Step number="03" title="Agende e cobre" desc="Calendario pro + assinaturas recorrentes." href="/register" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Dicas</p>
            <h2 className="text-3xl font-semibold">Ideias para gerar curiosidade e fechar assinaturas</h2>
          </div>
          <Link
            href="/login"
            className="rounded-xl border border-white/15 px-5 py-3 text-gray-100 hover:bg-white/10 transition"
          >
            Entrar no painel
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Tip title="Antes/depois" desc="Mostre graficos de evolucao e imagens do cao." href="/register" />
          <Tip title="Treinos ao vivo" desc="Agenda profissional com presenca e status." href="/register" />
          <Tip title="Plano recorrente" desc="Mostre economia e consistencia com assinatura." href="/register" />
        </div>
      </section>

      <section id="planos" className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Planos</p>
          <h2 className="text-3xl font-semibold">Escolha o plano e comece hoje</h2>
          <p className="text-gray-300/80">Tudo que voce precisa para vender mais e treinar melhor.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlanCard
            name="Starter"
            price="R$ 79/mes"
            desc="Para comecar com agenda e progresso basico."
            ctaLabel="Assinar Starter"
            ctaHref="/billing"
          />
          <PlanCard
            name="Pro"
            price="R$ 149/mes"
            desc="Caes ilimitados, relatorios e automacoes."
            ctaLabel="Assinar Pro"
            ctaHref="/billing"
            highlight
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-300/80">
          <div className="flex flex-wrap gap-4">
            <Link href="/data-policy" className="hover:underline underline-offset-4">
              Politica de uso de dados
            </Link>
            <Link href="/forum/rules" className="hover:underline underline-offset-4">
              Regras do forum
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Feature({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/20 hover:bg-white/10 transition">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-gray-300 text-sm">{desc}</p>
    </Link>
  )
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/20 hover:bg-white/10 transition">
      <p className="text-xs uppercase tracking-wide text-gray-300/70">{label}</p>
      <p className="text-xl font-semibold text-white">{value}</p>
    </Link>
  )
}

function PhotoCard({ title, desc, accent, href }: { title: string; desc: string; accent: string; href: string }) {
  return (
    <Link href={href} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl hover:bg-white/10 transition">
      <div className={`h-40 rounded-2xl bg-gradient-to-br ${accent} to-transparent border border-white/10`} />
      <div className="mt-4">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-gray-300 text-sm">{desc}</p>
      </div>
    </Link>
  )
}

function Step({ number, title, desc, href }: { number: string; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">{number}</p>
      <p className="text-lg font-semibold mt-2">{title}</p>
      <p className="text-gray-300 text-sm">{desc}</p>
    </Link>
  )
}

function Tip({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-gray-300 text-sm">{desc}</p>
    </Link>
  )
}

function PlanCard({
  name,
  price,
  desc,
  ctaLabel,
  ctaHref,
  highlight,
}: {
  name: string
  price: string
  desc: string
  ctaLabel: string
  ctaHref: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-3xl border ${highlight ? "border-cyan-300/40" : "border-white/10"} bg-white/5 p-6 shadow-2xl`}>
      <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">{name}</p>
      <p className="text-3xl font-semibold mt-2">{price}</p>
      <p className="text-gray-300 mt-2">{desc}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
