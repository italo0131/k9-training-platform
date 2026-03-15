import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { requireUser, isAdminSession } from "@/lib/auth"

export default async function CalendarPage() {
  const session = await requireUser()
  const where = isAdminSession(session) ? {} : { userId: session.user.id }

  const events = await prisma.schedule.findMany({
    where,
    orderBy: { date: "asc" },
    include: { user: true },
  })

  const grouped = events.reduce<Record<string, typeof events>>((acc, ev) => {
    const key = new Date(ev.date).toISOString().slice(0, 10)
    acc[key] = acc[key] || []
    acc[key].push(ev)
    return acc
  }, {})

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Agenda</p>
          <h1 className="text-3xl font-semibold">Calendario de treinos</h1>
          <p className="text-gray-300/80">Veja aulas e sessoes marcadas.</p>
        </div>

        {events.length === 0 && <p className="text-gray-300">Nenhum agendamento.</p>}

        <div className="space-y-4">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
              <p className="text-lg font-semibold">
                {new Date(day).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href="/calendar"
                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                  >
                    <p className="text-sm font-semibold">
                      {new Date(item.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-gray-300 text-sm">Status: {item.status}</p>
                    {item.user && <p className="text-gray-400 text-sm">Tutor: {item.user.name}</p>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
