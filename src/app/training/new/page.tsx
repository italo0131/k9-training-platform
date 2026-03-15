"use client"

import { useEffect, useState, FormEvent } from "react"
import { useRouter } from "next/navigation"

type Dog = { id: string; name: string }

export default function NewTrainingPage() {
  const router = useRouter()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [dogId, setDogId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [progress, setProgress] = useState("0")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/dogs")
      .then((r) => r.json())
      .then((data) => {
        setDogs(data || [])
        if (data?.length) setDogId(data[0].id)
      })
      .catch(() => setMessage("Erro ao carregar cães"))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dogId, title, description, progress: Number(progress) }),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        setMessage(data.message || "Erro ao salvar treino")
        return
      }
      setMessage("Sessão de treino criada")
      router.push("/training")
    } catch (err) {
      console.error(err)
      setMessage("Erro ao salvar treino")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center text-white">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!dogs.length) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center text-white gap-4">
        <p>Nenhum cão disponível. Cadastre um cão primeiro.</p>
        <button
          onClick={() => router.push("/dogs/new")}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold"
        >
          Cadastrar cão
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto space-y-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-8 shadow-2xl">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Treinos</p>
          <h1 className="text-3xl font-semibold">Nova sessão de treino</h1>
          <p className="text-gray-300/80">Registre progresso e descrição para o cão selecionado.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Cão</label>
            <select
              value={dogId}
              onChange={(e) => setDogId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id} className="text-black">
                  {dog.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Obediência básica"
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Senta, fica, junto..."
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Progresso (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
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
              {saving ? "Salvando..." : "Salvar treino"}
            </button>
          </div>
        </form>

        {message && <p className="text-sm text-cyan-100">{message}</p>}
      </div>
    </div>
  )
}




