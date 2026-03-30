import Link from "next/link"

import VideoEmbed from "@/app/components/VideoEmbed"
import { prisma } from "@/lib/prisma"
import { getRoleLabel } from "@/lib/role"
import { getBlogPostTypeLabel } from "@/lib/platform"

export default async function BlogReelsPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      videoUrl: { not: null },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      author: true,
      _count: { select: { comments: true, reactions: true } },
    },
    take: 18,
  })

  const reels = posts.filter((post) => post.postType !== "EVENTO")
  const totalEngagement = reels.reduce((sum, item) => sum + item._count.comments + item._count.reactions, 0)

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.14),transparent_24%),linear-gradient(145deg,#020617,#0f172a_55%,#020617)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(140deg,rgba(88,28,135,0.28),rgba(15,23,42,0.86)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_32%)] p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-200/80">Reels K9</p>
              <h1 className="text-3xl font-semibold md:text-4xl">Feed rapido para dicas, rotina e autoridade em video.</h1>
              <p className="text-slate-300">
                Aqui entram os videos curtos do blog. Ideal para cortes de aula, dicas de veterinario, tecnicas de adestramento e bastidores que puxam o usuario para dentro da plataforma.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-gray-100 transition hover:bg-white/10"
              >
                Voltar ao blog
              </Link>
              <Link
                href="/blog/new"
                className="rounded-2xl bg-[linear-gradient(135deg,#d946ef,#06b6d4)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20"
              >
                Criar reel
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Metric title="Videos no feed" value={String(reels.length)} description="Reels e posts em video prontos para consumo rapido" />
            <Metric title="Criadores" value={String(new Set(reels.map((post) => post.authorId)).size)} description="Profissionais, clientes e equipe produzindo" />
            <Metric title="Engajamento" value={String(totalEngagement)} description="Curtidas e comentarios concentrados na trilha em video" />
          </div>
        </section>

        {reels.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/15 bg-white/5 p-8 text-slate-300">
            Nenhum reel publicado ainda. O primeiro video que entrar no blog ja aparece aqui.
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {reels.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.74))] shadow-xl shadow-black/30"
              >
                <div className="grid gap-0 lg:grid-cols-[0.72fr_1fr]">
                  <div className="bg-slate-950/70 p-4">
                    <VideoEmbed url={post.videoUrl} title={post.title} variant="reel" poster={post.coverImageUrl} />
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em]">
                      <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-fuchsia-100">
                        {post.postType === "REEL" ? "Reel" : getBlogPostTypeLabel(post.postType)}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-gray-100">{post.category}</span>
                      <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-cyan-100">{getRoleLabel(post.author.role)}</span>
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold">{post.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{truncate(post.excerpt || post.content, 180)}</p>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
                      <span>{post.author.name}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      <span>{post._count.reactions} curtidas</span>
                      <span>{post._count.comments} comentarios</span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="rounded-2xl bg-[linear-gradient(135deg,#d946ef,#06b6d4)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20"
                      >
                        Abrir post completo
                      </Link>
                      <Link
                        href="/blog"
                        className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-gray-100 transition hover:bg-white/10"
                      >
                        Continuar no blog
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  )
}

function truncate(value: string | null | undefined, max = 160) {
  if (!value) return ""
  return value.length > max ? `${value.slice(0, max).trim()}...` : value
}
