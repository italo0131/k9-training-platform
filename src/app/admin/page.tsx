"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { isRootRole } from "@/lib/role"

const cards = [
  { href: "/dashboard", title: "Root console", desc: "Resumo global e alertas" },
  { href: "/admin/users", title: "Usuarios", desc: "Papeis, status e 2FA" },
  { href: "/admin/clients", title: "Clientes", desc: "Progresso e verificacoes" },
  { href: "/admin/dogs", title: "Caes", desc: "Dados e transferencias" },
  { href: "/admin/trainings", title: "Treinos", desc: "Progresso e conteudo" },
  { href: "/admin/schedule", title: "Agenda", desc: "Status e horarios" },
  { href: "/admin/finance", title: "Financeiro", desc: "Pagamentos e assinaturas" },
  { href: "/admin/security", title: "Seguranca", desc: "Suspensoes e auditoria" },
  { href: "/admin/companies", title: "Empresas", desc: "Visao por unidade" },
]

export default function AdminPage() {
  const { data } = useSession()
  const isRoot = isRootRole(data?.user?.role)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [key, setKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("ADMIN")

  const promote = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify({ email, role: isRoot ? role : "ADMIN" }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setMessage(data.message || "Erro ao promover")
        return
      }
      setMessage(isRoot ? "Usuario atualizado" : "Usuario promovido a admin")
    } catch (err) {
      console.error(err)
      setMessage("Erro ao promover")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Root menu</p>
          <h1 className="text-3xl font-semibold">Painel tecnico</h1>
          <p className="text-gray-300/80">Acesso rapido a todas as areas criticas da plataforma.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 hover:-translate-y-0.5 transition"
            >
              <p className="text-lg font-semibold">{card.title}</p>
              <p className="text-sm text-gray-300 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Acesso rapido</p>
            <h2 className="text-xl font-semibold">Promover usuario</h2>
            <p className="text-sm text-gray-300">Use a chave para elevar permissoes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-200/80">Email do usuario</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
              />
            </div>

            {isRoot && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Novo papel</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="TRAINER">TRAINER</option>
                  <option value="CLIENT">CLIENT</option>
                  <option value="ROOT">ROOT</option>
                  <option value="SUPERADMIN">SUPERADMIN</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Chave secreta (ADMIN_API_KEY)</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
            />
          </div>

          <button
            onClick={promote}
            disabled={loading}
            className="rounded-lg bg-cyan-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Processando..." : isRoot ? "Atualizar usuario" : "Promover para admin"}
          </button>

          {message && <p className="text-sm text-cyan-100">{message}</p>}
        </div>
      </div>
    </div>
  )
}
