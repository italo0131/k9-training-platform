"use client"

import { FormEvent, useState } from "react"
import { useSession } from "next-auth/react"

export default function ReplyForm({ threadId }: { threadId: string }) {
  const { data } = useSession()
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!data?.user) {
      setMessage("Faça login para responder.")
      return
    }
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch(`/api/forum/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const payload = await res.json()
      if (!res.ok || payload.success === false) {
        setMessage(payload.message || "Erro ao responder")
        return
      }
      setContent("")
      window.location.reload()
    } catch (err) {
      console.error(err)
      setMessage("Erro ao responder")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="text-sm text-gray-200/80">Sua resposta</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        required
        className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
      />
      <div className="flex gap-3 justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-cyan-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Enviando..." : "Responder"}
        </button>
      </div>
      {message && <p className="text-sm text-cyan-100">{message}</p>}
    </form>
  )
}
