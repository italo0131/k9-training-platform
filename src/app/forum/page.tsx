import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { requireUser } from "@/lib/auth"

export default async function ForumPage() {
  await requireUser()
  const threads = await prisma.forumThread.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { replies: true } } },
  })

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Fórum</p>
            <h1 className="text-3xl font-semibold">Perguntas e comunidade</h1>
            <p className="text-gray-300/80">Troque experiências com outros clientes.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/forum/rules"
              className="rounded-xl border border-white/15 px-4 py-2 text-gray-100 hover:bg-white/10 transition"
            >
              Regras
            </Link>
            <Link
              href="/forum/new"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-white font-semibold shadow-lg shadow-cyan-500/20"
            >
              Novo tópico
            </Link>
          </div>
        </div>

        {threads.length === 0 && <p className="text-gray-300">Nenhum tópico ainda. Seja o primeiro.</p>}

        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/${thread.id}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{thread.title}</h2>
                <span className="text-xs text-gray-400">{thread._count.replies} respostas</span>
              </div>
              <p className="text-gray-300 text-sm mt-2">{thread.content.slice(0, 160)}...</p>
              <p className="text-xs text-gray-400 mt-3">
                {thread.author.name} •{" "}
                {new Date(thread.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}




