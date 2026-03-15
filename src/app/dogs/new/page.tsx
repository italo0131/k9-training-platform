"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAdminRole } from "@/lib/role"

type Owner = { id: string; name: string }

export default function NewDogPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [age, setAge] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [owners, setOwners] = useState<Owner[]>([])
  const [loadingOwners, setLoadingOwners] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [canCreate, setCanCreate] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const meResp = await fetch("/api/profile", { redirect: "follow" })
        const contentType = meResp.headers.get("content-type") || ""
        const meText = await meResp.text()
        const isJson = contentType.includes("application/json")
        const me = isJson && meText ? JSON.parse(meText) : null

        if (!meResp.ok || !me?.user) {
          if (meResp.status === 401) {
            setMessage("Faça login para cadastrar um cão.")
          } else if (!isJson) {
            setMessage("Sua conta precisa ser verificada para continuar.")
          } else {
            setMessage(me?.message || "Não foi possível carregar seus dados.")
          }
          setCanCreate(false)
          return
        }

        setOwnerId(me.user.id)
        setIsAdmin(isAdminRole(me.user.role))
        setCanCreate(true)

        if (isAdminRole(me.user.role)) {
          const usersResp = await fetch("/api/users")
          const usersText = await usersResp.text()
          const users = usersText ? JSON.parse(usersText) : []
          setOwners(users)
        } else {
          setOwners([{ id: me.user.id, name: me.user.name }])
        }
      } catch (err) {
        console.error("Erro ao carregar tutores", err)
        setMessage("Erro ao carregar dados do usuário.")
      } finally {
        setLoadingOwners(false)
      }
    }
    load()
  }, [])

  const createDog = async () => {
    setSubmitting(true)
    setMessage("")
    try {
      const response = await fetch("/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          breed,
          age: Number(age),
          ownerId,
        }),
      })

      const text = await response.text()
      if (!text) {
        setMessage("API retornou resposta vazia")
        return
      }
      const data = JSON.parse(text)

      if (!response.ok || !data.success) {
        setMessage(data.message || "Erro ao cadastrar cão")
        return
      }

      setMessage("Cão cadastrado com sucesso")
      setName("")
      setBreed("")
      setAge("")
      setOwnerId("")
      router.push("/dogs")
    } catch (error) {
      console.error("ERRO FRONT:", error)
      setMessage("Erro ao cadastrar cão")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!ownerId) {
      setMessage("Selecione um tutor")
      return
    }
    createDog()
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-xl mx-auto space-y-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Cães</p>
          <h1 className="text-2xl font-semibold">Cadastrar cão</h1>
          <p className="text-sm text-gray-300/80">Preencha os dados do cão e selecione o tutor.</p>
        </div>

        {!loadingOwners && !canCreate ? (
          <div className="space-y-4">
            <p className="text-gray-300">{message || "Você precisa estar logado para cadastrar cães."}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/login")}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold"
              >
                Ir para login
              </button>
              <button
                onClick={() => router.push("/verify")}
                className="rounded-lg border border-white/15 px-4 py-2 text-gray-100 hover:bg-white/10 transition"
              >
                Verificar conta
              </button>
              <button
                onClick={() => router.push("/register")}
                className="rounded-lg border border-white/15 px-4 py-2 text-gray-100 hover:bg-white/10 transition"
              >
                Criar conta
              </button>
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Nome</label>
            <input
              type="text"
              placeholder="Rex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Raça</label>
            <input
              type="text"
              placeholder="Border Collie"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Idade</label>
            <input
              type="number"
              placeholder="3"
              min={0}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
            />
          </div>

          {isAdmin ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-200/80">Tutor</label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                disabled={loadingOwners}
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
              >
                <option value="">{loadingOwners ? "Carregando tutores..." : "Selecione o tutor"}</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id} className="text-black">
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-gray-300/80">
              Tutor definido automaticamente: <span className="text-white">{owners.find((o) => o.id === ownerId)?.name ?? "Você"}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-cyan-500 px-4 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Salvando..." : "Cadastrar"}
          </button>
          </form>
        )}

        {message && <p className="text-sm text-cyan-100">{message}</p>}
      </div>
    </div>
  )
}




