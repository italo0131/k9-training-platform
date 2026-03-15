import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { requireUser } from "@/lib/auth"

type TipItem = {
  id: string
  dogName: string
  avg: number
  sessions: number
  level: string
  message: string
}

export default async function ConteudosPage() {
  const session = await requireUser()

  const [posts, trainings, schedules, dogs] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { author: true },
    }),
    prisma.trainingSession.findMany({
      where: { dog: { ownerId: session.user.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { dog: true },
    }),
    prisma.schedule.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.dog.findMany({
      where: { ownerId: session.user.id },
      include: { trainings: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  const tips: TipItem[] = dogs.map((dog) => {
    const sessions = dog.trainings || []
    const avg = sessions.length
      ? Math.round(sessions.reduce((sum, t) => sum + t.progress, 0) / sessions.length)
      : 0
    let level = "Basico"
    let message = "Reforce comandos basicos e mantenha rotina curta diaria."
    if (avg >= 35 && avg < 70) {
      level = "Intermediario"
      message = "Adicione distracoes controladas e mantenha reforco positivo."
    }
    if (avg >= 70) {
      level = "Avancado"
      message = "Varie ambientes e introduza desafios mais complexos."
    }
    return {
      id: dog.id,
      dogName: dog.name,
      avg,
      sessions: sessions.length,
      level,
      message,
    }
  })

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 py-10 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Conteudos</p>
          <h1 className="text-3xl font-semibold">Feed do cliente</h1>
          <p className="text-gray-300/80">Posts, dicas e atualizacoes reais do seu progresso.</p>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Posts recentes</h2>
              <Link href="/blog" className="text-cyan-300 text-sm hover:underline underline-offset-4">
                Ver blog
              </Link>
            </div>
            {posts.length === 0 && <p className="text-gray-300">Sem posts publicados.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                >
                  <p className="text-xs uppercase tracking-wide text-cyan-200/80">{post.author.name}</p>
                  <h3 className="text-lg font-semibold mt-1">{post.title}</h3>
                  <p className="text-sm text-gray-300 mt-2">
                    {post.excerpt || post.content.slice(0, 120)}{post.content.length > 120 ? "..." : ""}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Proximos treinos</h2>
              <p className="text-sm text-gray-300">Agenda do seu perfil.</p>
            </div>
            {schedules.length === 0 && <p className="text-gray-300 text-sm">Sem agendamentos.</p>}
            <div className="space-y-2">
            {schedules.map((item) => (
                <Link
                  key={item.id}
                  href="/calendar"
                  className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
                >
                  <p className="text-sm font-semibold">
                    {new Date(item.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">Status: {item.status}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Dicas personalizadas</h2>
            <Link href="/dogs" className="text-cyan-300 text-sm hover:underline underline-offset-4">
              Ver caes
            </Link>
          </div>
          {tips.length === 0 && <p className="text-gray-300">Cadastre um cao para receber dicas.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tips.map((tip) => (
              <Link
                key={tip.id}
                href={`/training?dog=${tip.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{tip.dogName}</p>
                  <span className="text-xs rounded-full border border-cyan-400/40 px-2 py-1 text-cyan-200">
                    {tip.level}
                  </span>
                </div>
                <p className="text-lg font-semibold">{tip.avg}%</p>
                <p className="text-xs text-gray-400">Sessoes: {tip.sessions}</p>
                <p className="text-sm text-gray-300">{tip.message}</p>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${tip.avg}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Atualizacoes recentes</h2>
            <Link href="/training" className="text-cyan-300 text-sm hover:underline underline-offset-4">
              Ver treinos
            </Link>
          </div>
          {trainings.length === 0 && <p className="text-gray-300">Nenhum treino registrado.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainings.map((training) => (
              <Link
                key={training.id}
                href={training.dog?.id ? `/training?dog=${training.dog.id}` : "/training"}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              >
                <p className="text-sm text-gray-400">
                  {new Date(training.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </p>
                <p className="text-lg font-semibold mt-1">{training.title}</p>
                <p className="text-sm text-gray-300">{training.description}</p>
                <p className="text-xs text-gray-400 mt-2">Cao: {training.dog?.name}</p>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${training.progress}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
