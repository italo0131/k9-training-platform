import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { requireUser, isAdminSession } from "@/lib/auth"

export default async function DogsPage() {
  const session = await requireUser()
  const where = isAdminSession(session) ? {} : { ownerId: session.user.id }

  const dogs = await prisma.dog.findMany({
    where,
    include: { owner: true, trainings: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Caes</p>
            <h1 className="text-3xl font-semibold">Lista de caes</h1>
            <p className="text-gray-300/80">Acompanhe os caes cadastrados e seus treinos.</p>
          </div>
          <Link
            href="/dogs/new"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold hover:-translate-y-0.5 transition shadow-lg shadow-cyan-500/25"
          >
            Novo cao
          </Link>
        </div>

        {dogs.length === 0 && <p className="text-gray-300">Nenhum cao cadastrado.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dogs.map((dog) => {
            const progress =
              dog.trainings.length > 0
                ? Math.round(dog.trainings.reduce((s, t) => s + t.progress, 0) / dog.trainings.length)
                : 0
            return (
              <Link
                key={dog.id}
                href={`/training?dog=${dog.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 space-y-2 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{dog.name}</h3>
                  <span className="text-xs text-gray-400">#{dog.id.slice(0, 6)}</span>
                </div>
                <p className="text-gray-300 text-sm">Raca: {dog.breed}</p>
                <p className="text-gray-300 text-sm">Idade: {dog.age}</p>
                {dog.owner && <p className="text-gray-400 text-sm">Tutor: {dog.owner.name}</p>}
                <p className="text-gray-400 text-sm">Treinos: {dog.trainings.length}</p>
                <div>
                  <div className="flex justify-between text-sm text-gray-200">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-cyan-300 text-sm">Abrir treinos</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
