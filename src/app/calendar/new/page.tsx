"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function NewSchedulePage() {
  const router = useRouter()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [status, setStatus] = useState("Pendente")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const iso = date && time ? `${date}T${time}:00` : date
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: iso, status }),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        setMessage(data.message || "Erro ao salvar agendamento")
        return
      }
      setMessage("Agendamento criado")
      router.push("/calendar")
    } catch (err) {
      console.error(err)
      setMessage("Erro ao salvar agendamento")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-8 shadow-2xl">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Agenda</p>
          <h1 className="text-3xl font-semibold">Novo agendamento</h1>
          <p className="text-gray-300/80">Marque uma aula ou sessão de treino.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Hora</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              <option className="text-black">Pendente</option>
              <option className="text-black">Confirmado</option>
              <option className="text-black">Concluído</option>
              <option className="text-black">Cancelado</option>
            </select>
          </div>

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
              {saving ? "Salvando..." : "Salvar agendamento"}
            </button>
          </div>
        </form>

        {message && <p className="text-sm text-cyan-100">{message}</p>}
      </div>
    </div>
  )
}




