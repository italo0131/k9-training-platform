"use client"

import Link from "next/link"
import { useState } from "react"

type TrainingRow = {
  id: string
  title: string
  description: string
  progress: number
  dogId: string
  dogName?: string | null
  ownerName?: string | null
}

export default function TrainingsTable({ initialTrainings }: { initialTrainings: TrainingRow[] }) {
  const [rows, setRows] = useState<TrainingRow[]>(initialTrainings)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = rows.filter((row) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      row.title.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q) ||
      (row.dogName || "").toLowerCase().includes(q) ||
      (row.ownerName || "").toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const setLoading = (id: string, value: boolean) => {
    setBusy((prev) => ({ ...prev, [id]: value }))
  }

  const updateTraining = async (id: string, payload: any) => {
    setLoading(id, true)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/training/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setMessage(data.message || "Erro ao atualizar treino")
        return
      }
      const training = data.training
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? { ...row, title: training.title, description: training.description, progress: training.progress }
            : row
        )
      )
      setMessage("Treino atualizado")
    } catch (err) {
      console.error(err)
      setMessage("Erro ao atualizar treino")
    } finally {
      setLoading(id, false)
    }
  }

  const removeTraining = async (id: string) => {
    setLoading(id, true)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/training/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setMessage(data.message || "Erro ao remover treino")
        return
      }
      setRows((prev) => prev.filter((row) => row.id !== id))
      setMessage("Treino removido")
    } catch (err) {
      console.error(err)
      setMessage("Erro ao remover treino")
    } finally {
      setLoading(id, false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Treinos</h1>
          <p className="text-sm text-gray-300">Edite progresso e descricoes.</p>
        </div>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar por treino, descricao, cao ou tutor"
          className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
        />
      </div>

      {message && <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">{message}</div>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm">
          <thead className="text-gray-300">
            <tr className="border-b border-white/10">
              <th className="p-3 text-left">Treino</th>
              <th className="p-3 text-left">Progresso</th>
              <th className="p-3 text-left">Cao</th>
              <th className="p-3 text-left">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="p-3">
                  <input
                    value={row.title}
                    onChange={(e) =>
                      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, title: e.target.value } : item)))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-white text-xs"
                  />
                  <textarea
                    value={row.description}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((item) => (item.id === row.id ? { ...item, description: e.target.value } : item))
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-white text-xs"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={row.progress}
                    onChange={(e) =>
                      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, progress: Number(e.target.value) } : item)))
                    }
                    className="w-24 rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-white text-xs"
                  />
                </td>
                <td className="p-3 text-xs text-gray-300">
                  <div>{row.dogName || row.dogId}</div>
                  <div className="text-gray-500">{row.ownerName || ""}</div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/training/${row.id}`}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white hover:bg-white/10"
                    >
                      Ver
                    </Link>
                    <button
                      disabled={!!busy[row.id]}
                      onClick={() => updateTraining(row.id, { title: row.title, description: row.description, progress: row.progress })}
                      className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Salvar
                    </button>
                    <button
                      disabled={!!busy[row.id]}
                      onClick={() => removeTraining(row.id)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white hover:bg-white/10"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-300">
        <div>
          Pagina {currentPage} de {totalPages} • {filtered.length} treinos
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs disabled:opacity-50"
          >
            Proxima
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  )
}
