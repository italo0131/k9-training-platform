"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { isStaffRole } from "@/lib/role"

export default function NewBlogPostPage() {
  const router = useRouter()
  const { data, status } = useSession()
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const canPublish = isStaffRole(data?.user?.role)

  useEffect(() => {
    if (status === "loading") return
    if (!data?.user) {
      router.replace("/login")
      return
    }
  }, [data, status, router])

  useEffect(() => {
    if (!canPublish) {
      setPublished(false)
    }
  }, [canPublish])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content, published: canPublish ? published : false }),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        setMessage(data.message || "Erro ao salvar post")
        return
      }
      if (!canPublish) {
        setMessage("Post enviado para revisao.")
        router.push("/blog")
        return
      }
      router.push(`/blog/${data.post.slug}`)
    } catch (err) {
      console.error(err)
      setMessage("Erro ao salvar post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Blog</p>
          <h1 className="text-3xl font-semibold">Novo post</h1>
          <p className="text-gray-300/80">Compartilhe conhecimento com seus clientes.</p>
          {!canPublish && (
            <p className="text-xs text-amber-200 mt-2">
              Seu post sera enviado para revisao antes de publicar.
            </p>
          )}
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Resumo</label>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Conteúdo</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-200/80">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              disabled={!canPublish}
            />
            Publicar agora
          </label>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-white/15 px-4 py-3 text-gray-100 hover:bg-white/10 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-cyan-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Publicar"}
            </button>
          </div>
        </form>

        {message && <p className="text-sm text-cyan-100">{message}</p>}
      </div>
    </div>
  )
}




