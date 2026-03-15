import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { requireUser } from "@/lib/auth"

type DogProgress = {
  id: string
  name: string
  progress: number
  sessions: number
  delta: number
  history: number[]
  breed: string
  age: number
}

export default async function ProfilePage() {
  const session = await requireUser()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { dogs: { include: { trainings: true } } },
  })

  if (!user) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-xl w-full text-center rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Nenhum usuario encontrado</h1>
          <p className="mt-2 text-gray-300">Crie uma conta para acessar o perfil.</p>
          <Link
            href="/register"
            className="inline-block mt-6 rounded-lg bg-cyan-500 px-4 py-3 text-white font-semibold hover:-translate-y-0.5 transition shadow-lg shadow-cyan-500/20"
          >
            Criar conta
          </Link>
        </div>
      </div>
    )
  }

  const [trainingsCount, schedulesCount, recentTrainings, paymentAgg, lastPayment, paymentCount] = await Promise.all([
    prisma.trainingSession.count({
      where: { dog: { ownerId: user.id } },
    }),
    prisma.schedule.count({
      where: { userId: user.id },
    }),
    prisma.trainingSession.findMany({
      where: { dog: { ownerId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { dog: true },
    }),
    prisma.payment.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    }),
    prisma.payment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({
      where: { userId: user.id },
    }),
  ])

  const progressByDog: DogProgress[] = user.dogs.map((dog) => {
    const sessions = (dog.trainings || []).slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const avg = sessions.length
      ? Math.round(sessions.reduce((sum, t) => sum + t.progress, 0) / sessions.length)
      : 0
    const first = sessions[0]
    const last = sessions[sessions.length - 1]
    const delta = first && last ? last.progress - first.progress : 0
    const history = sessions.slice(-6).map((t) => t.progress)
    return {
      id: dog.id,
      name: dog.name,
      progress: avg,
      sessions: sessions.length,
      delta,
      history,
      breed: dog.breed,
      age: dog.age,
    }
  })

  const totalPaid = paymentAgg._sum.amount || 0
  const subscriptionStatus = lastPayment?.status || "sem eventos"

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 py-10 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Perfil</p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Ola, {user.name}</h1>
            <Link
              href="/profile/edit"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold hover:-translate-y-0.5 transition shadow-lg shadow-cyan-500/25"
            >
              Editar perfil
            </Link>
          </div>
          <p className="text-gray-300/80">Gerencie seus dados e os caes associados.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
            <p className="text-gray-300 text-sm">Nome</p>
            <p className="text-xl font-semibold">{user.name}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
            <p className="text-gray-300 text-sm">Email</p>
            <p className="text-xl font-semibold break-words">{user.email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
            <p className="text-gray-300 text-sm">Caes cadastrados</p>
            <p className="text-3xl font-semibold">{user.dogs.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
            <p className="text-gray-300 text-sm">Treinos</p>
            <p className="text-3xl font-semibold">{trainingsCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
            <p className="text-gray-300 text-sm">Agendamentos</p>
            <p className="text-3xl font-semibold">{schedulesCount}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Plano e assinatura</h2>
            <Link href="/billing" className="text-cyan-300 text-sm hover:underline underline-offset-4">
              Gerenciar assinatura
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-gray-300">Status atual</p>
              <p className="text-2xl font-semibold mt-1">{subscriptionStatus}</p>
              <p className="text-xs text-gray-400 mt-2">Ultimo evento: {lastPayment ? lastPayment.type : "nenhum"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-gray-300">Total pago (centavos)</p>
              <p className="text-2xl font-semibold mt-1">{totalPaid}</p>
              <p className="text-xs text-gray-400 mt-2">Eventos: {paymentCount}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Evolucao e progresso</h2>
            <span className="text-xs text-gray-300">Media por cao</span>
          </div>
          {progressByDog.length === 0 && <p className="text-gray-300">Nenhum treino registrado.</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {progressByDog.map((dog) => {
              const history =
                dog.history.length < 6
                  ? Array(6 - dog.history.length).fill(0).concat(dog.history)
                  : dog.history
              const deltaLabel = dog.delta === 0 ? "0%" : `${dog.delta > 0 ? "+" : ""}${dog.delta}%`
              return (
                <Link
                  key={dog.id}
                  href={`/training?dog=${dog.id}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold">{dog.name}</p>
                      <p className="text-xs text-gray-400">Raca: {dog.breed} • Idade: {dog.age}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-cyan-300">{dog.progress}%</p>
                      <p className={`text-xs ${dog.delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        Evolucao: {deltaLabel}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Sessoes: {dog.sessions}</span>
                      <span>Ultimos treinos</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${dog.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1 h-12 items-end">
                    {history.map((value, index) => (
                      <div key={`${dog.id}-${index}`} className="rounded-md bg-white/10 h-full flex items-end">
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-cyan-400 to-emerald-400"
                          style={{ height: `${Math.max(10, value)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Ultimas sessoes</h2>
            <Link href="/training" className="text-cyan-300 text-sm hover:underline underline-offset-4">
              Ver treinos
            </Link>
          </div>
          {recentTrainings.length === 0 && <p className="text-gray-300">Nenhuma sessao registrada.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentTrainings.map((training) => (
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
                <p className="text-xs text-gray-400 mt-2">Cao: {training.dog?.name || "-"}</p>
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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Meus caes</h2>
            <Link href="/dogs/new" className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
              Adicionar cao
            </Link>
          </div>
          {user.dogs.length === 0 && <p className="text-gray-300">Nenhum cao cadastrado.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.dogs.map((dog) => (
              <Link
                key={dog.id}
                href={`/training?dog=${dog.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              >
                <p className="text-lg font-semibold">{dog.name}</p>
                <p className="text-gray-300">Raca: {dog.breed}</p>
                <p className="text-gray-300">Idade: {dog.age} anos</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
