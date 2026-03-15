import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getAuthSession } from "@/lib/auth"
import { isStaffRole } from "@/lib/role"

export default async function BlogPage() {
  const session = await getAuthSession()
  const canWrite = isStaffRole(session?.user?.role)

  const posts = await prisma.blogPost.findMany({
    where: canWrite ? {} : { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  })

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Blog</p>
            <h1 className="text-3xl font-semibold">Conteúdos e dicas profissionais</h1>
            <p className="text-gray-300/80">Atualizações reais do seu centro de treinamento.</p>
          </div>
          {canWrite ? (
            <Link
              href="/blog/new"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-white font-semibold shadow-lg shadow-cyan-500/20"
            >
              Novo post
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-4 py-2 text-gray-100 hover:bg-white/10 transition"
            >
              Entrar para publicar
            </Link>
          )}
        </div>

        {posts.length === 0 && <p className="text-gray-300">Nenhum post publicado ainda.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg hover:bg-white/10 transition"
            >
              <p className="text-xs uppercase tracking-wide text-cyan-200/80">
                {post.author.name} {post.published ? "" : "â€¢ Rascunho"}
              </p>
              <h2 className="text-xl font-semibold mt-2">{post.title}</h2>
              <p className="text-gray-300 text-sm mt-2">
                {post.excerpt || post.content.slice(0, 160)}{post.content.length > 160 ? "..." : ""}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}





