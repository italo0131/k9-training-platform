"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phone
      })
    })

    const data = await res.json()

    if (res.ok && data.success) {
      setMessage("Usuário criado com sucesso!")
      setName("")
      setEmail("")
      setPassword("")
      await signIn("credentials", { email, password, redirect: false })
    } else {
      setMessage(data.message || "Erro ao criar usuário")
    }
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="relative mx-auto flex min-h-[100svh] max-w-5xl flex-col px-4 sm:px-6 py-12 md:flex-row md:items-center md:gap-8 lg:gap-10">
        <div className="flex-1 space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-200/80">
            Onboarding • K9
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">Crie sua conta e comece a treinar em minutos.</h1>
          <p className="max-w-xl text-lg text-gray-300/85">
            Cadastre tutores, cães e treinos com segurança. Use o mesmo visual do painel e acesso a billing e admin.
          </p>
        </div>

        <div className="flex-1">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl mx-auto">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Cadastro</p>
              <h2 className="text-2xl font-semibold">Seja bem-vindo</h2>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Email</label>
                <input
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Telefone (opcional)</label>
                <input
                  type="tel"
                  placeholder="+55 65 9xxxx-xxxx"
                  value={phone}
                  onChange={(e)=>setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-white font-semibold shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                Criar conta
              </button>
            </form>

            {message && <p className="mt-4 text-sm text-emerald-100">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}




