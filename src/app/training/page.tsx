import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { requireUser, isAdminSession } from "@/lib/auth"

type Props = {
  searchParams: { dog?: string }
}

export default async function TrainingPage({ searchParams }: Props) {
  const session = await requireUser()
  const whereDog = isAdminSession(session) ? {} : { ownerId: session.user.id }
  const dogId = searchParams?.dog
  const dogs = await prisma.dog.findMany({ where: whereDog, select: { id: true, name: true } })

  const whereSession =
    dogId && dogs.some((d) => d.id === dogId)
      ? { dogId }
      : isAdminSession(session)
      ? {}
      : { dog: { ownerId: session.user.id } }

  const sessions = await prisma.trainingSession.findMany({
    where: whereSession,
    orderBy: { createdAt: "desc" },
    include: { dog: true },
  })

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Treinos</p>
            <h1 className="text-3xl font-semibold">Sessoes de treinamento</h1>
            <p className="text-gray-300/80">Progresso e historico por cao.</p>
          </div>
          <Link
            href="/dogs"
            className="rounded-lg border border-white/15 px-4 py-2 text-gray-100 hover:bg-white/10 transition"
          >
            Escolher outro cao
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 space-y-3">
          <label className="text-sm text-gray-200/80">Filtrar por cao</label>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/training"
              className={`px-3 py-2 rounded-lg text-sm ${!dogId ? "bg-cyan-500 text-white" : "bg-white/10 text-gray-100"}`}
            >
              Todos
            </Link>
            {dogs.map((dog) => (
              <Link
                key={dog.id}
                href={`/training?dog=${dog.id}`}
                className={`px-3 py-2 rounded-lg text-sm ${dogId === dog.id ? "bg-cyan-500 text-white" : "bg-white/10 text-gray-100"}`}
              >
                {dog.name}
              </Link>
            ))}
          </div>
        </div>

        {sessions.length === 0 && <p className="text-gray-300">Nenhum treino registrado.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/training/${session.id}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{session.title}</p>
                <span className="text-xs text-gray-400">
                  {new Date(session.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{session.description}</p>
              <div>
                <div className="flex justify-between text-sm text-gray-200">
                  <span>Progresso</span>
                  <span>{session.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${session.progress}%` }}
                  />
                </div>
              </div>
              {session.dog && <p className="text-gray-400 text-sm">Cao: {session.dog.name}</p>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
