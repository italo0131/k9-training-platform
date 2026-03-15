import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getAuthSession } from "@/lib/auth"
import { isStaffRole } from "@/lib/role"

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession()
  const canViewDrafts = isStaffRole(session?.user?.role)

  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  })

  if (!post || (!post.published && !canViewDrafts)) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center text-white">
        <p>Post não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/blog" className="text-cyan-300 hover:underline underline-offset-4">
          Voltar ao blog
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-wide text-cyan-200/80">{post.author.name}</p>
          <h1 className="text-3xl font-semibold mt-2">{post.title}</h1>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(post.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
          {post.excerpt && <p className="text-gray-300 mt-4">{post.excerpt}</p>}
          <div className="text-gray-200 mt-6 whitespace-pre-wrap leading-7">{post.content}</div>
        </div>
      </div>
    </div>
  )
}


