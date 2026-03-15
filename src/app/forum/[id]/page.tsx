import { prisma } from "@/lib/prisma"
import Link from "next/link"
import ReplyForm from "./ReplyForm"
import { requireUser } from "@/lib/auth"

export default async function ForumThreadPage({ params }: { params: { id: string } }) {
  await requireUser()
  const thread = await prisma.forumThread.findUnique({
    where: { id: params.id },
    include: { author: true, replies: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  })

  if (!thread) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center text-white">
        <p>Tópico não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/forum" className="text-cyan-300 hover:underline underline-offset-4">
          Voltar ao fórum
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <h1 className="text-2xl font-semibold">{thread.title}</h1>
          <p className="text-gray-300 mt-2 whitespace-pre-wrap">{thread.content}</p>
          <p className="text-xs text-gray-400 mt-4">
            {thread.author.name} •{" "}
            {new Date(thread.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold">Respostas ({thread.replies.length})</h2>
          {thread.replies.length === 0 && <p className="text-gray-300 mt-3">Nenhuma resposta ainda.</p>}
          <div className="mt-4 space-y-3">
            {thread.replies.map((reply) => (
              <div key={reply.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-gray-200 whitespace-pre-wrap">{reply.content}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {reply.author.name} •{" "}
                  {new Date(reply.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>

          <ReplyForm threadId={thread.id} />
        </div>
      </div>
    </div>
  )
}


