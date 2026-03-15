"use client"

import Link from "next/link"
import { useState } from "react"

type DogRow = {
  id: string
  name: string
  breed: string
  age: number
  ownerId: string
  ownerName?: string | null
}

type Owner = { id: string; name: string }

export default function DogsTable({ initialDogs, owners }: { initialDogs: DogRow[]; owners: Owner[] }) {
  const [rows, setRows] = useState<DogRow[]>(initialDogs)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = rows.filter((dog) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      dog.name.toLowerCase().includes(q) ||
      dog.breed.toLowerCase().includes(q) ||
      (dog.ownerName || "").toLowerCase().includes(q)
    const matchesOwner = ownerFilter === "all" || dog.ownerId === ownerFilter
    return matchesQuery && matchesOwner
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const setLoading = (id: string, value: boolean) => {
    setBusy((prev) => ({ ...prev, [id]: value }))
  }

  const updateDog = async (id: string, payload: any) => {
    setLoading(id, true)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/dogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setMessage(data.message || "Erro ao atualizar cao")
        return
      }
      const dog = data.dog
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                name: dog.name,
                breed: dog.breed,
                age: dog.age,
                ownerId: dog.ownerId,
                ownerName: dog.owner?.name,
              }
            : row
        )
      )
      setMessage("Cao atualizado")
    } catch (err) {
      console.error(err)
      setMessage("Erro ao atualizar cao")
    } finally {
      setLoading(id, false)
    }
  }

  const removeDog = async (id: string) => {
    setLoading(id, true)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/dogs/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setMessage(data.message || "Erro ao remover cao")
        return
      }
      setRows((prev) => prev.filter((row) => row.id !== id))
      setMessage("Cao removido")
    } catch (err) {
      console.error(err)
      setMessage("Erro ao remover cao")
    } finally {
      setLoading(id, false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Caes</h1>
          <p className="text-sm text-gray-300">Edite dados ou transfira tutor.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por nome, raca ou tutor"
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
          />
          <select
            value={ownerFilter}
            onChange={(e) => {
              setOwnerFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
          >
            <option value="all">Todos os tutores</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">{message}</div>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm">
          <thead className="text-gray-300">
            <tr className="border-b border-white/10">
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Raca</th>
              <th className="p-3 text-left">Idade</th>
              <th className="p-3 text-left">Tutor</th>
              <th className="p-3 text-left">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((dog) => (
              <tr key={dog.id} className="border-b border-white/5">
                <td className="p-3">
                  <input
                    value={dog.name}
                    onChange={(e) =>
                      setRows((prev) => prev.map((row) => (row.id === dog.id ? { ...row, name: e.target.value } : row)))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-white text-xs"
                  />
                </td>
                <td className="p-3">
                  <input
                    value={dog.breed}
                    onChange={(e) =>
                      setRows((prev) => prev.map((row) => (row.id === dog.id ? { ...row, breed: e.target.value } : row)))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-white text-xs"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={dog.age}
                    onChange={(e) =>
                      setRows((prev) => prev.map((row) => (row.id === dog.id ? { ...row, age: Number(e.target.value) } : row)))
                    }
                    className="w-24 rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-white text-xs"
                  />
                </td>
                <td className="p-3">
                  <select
                    value={dog.ownerId}
                    onChange={(e) =>
                      setRows((prev) => prev.map((row) => (row.id === dog.id ? { ...row, ownerId: e.target.value } : row)))
                    }
                    className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-white text-xs"
                  >
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/dogs/${dog.id}`}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white hover:bg-white/10"
                    >
                      Ver
                    </Link>
                    <button
                      disabled={!!busy[dog.id]}
                      onClick={() => updateDog(dog.id, { name: dog.name, breed: dog.breed, age: dog.age, ownerId: dog.ownerId })}
                      className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Salvar
                    </button>
                    <button
                      disabled={!!busy[dog.id]}
                      onClick={() => removeDog(dog.id)}
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
          Pagina {currentPage} de {totalPages} • {filtered.length} caes
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
