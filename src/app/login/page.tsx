"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await signIn("credentials", {
        email,
        password,
        twoFactorCode: needsTwoFactor ? twoFactorCode : undefined,
        redirect: false,
      })

      if (res?.error) {
        if (res.error === "2FA_REQUIRED") {
          setNeedsTwoFactor(true)
          setMessage("Código 2FA enviado. Verifique seu email.")
          return
        }
        if (res.error === "2FA_INVALID") {
          setMessage("Código 2FA inválido")
          return
        }
        if (res.error === "ACCOUNT_SUSPENDED") {
          setMessage("Conta suspensa. Fale com o suporte.")
          return
        }
        setMessage("Credenciais inválidas")
        return
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Erro ao logar", err)
      setMessage("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-slate-950 text-white">
      {/* backdrops */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_25%),radial-gradient(circle_at_60%_80%,rgba(16,185,129,0.12),transparent_30%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-4 sm:px-6 py-12 md:flex-row md:items-center md:gap-8 lg:gap-10">
        {/* Hero copy */}
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200/80">
            SaaS • K9 Training
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Plataforma de treino canino com controle total, insights e assinaturas.
          </h1>
          <p className="max-w-xl text-lg text-gray-300/85">
            Acompanhe a evolução dos cães, agenda profissional, billing com Stripe e painel admin — tudo em um só lugar.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-2xl">
            <Badge title="Uptime" value="99.9%" />
            <Badge title="Treinos/dia" value="+120" />
            <Badge title="Satisfação" value="4.9/5" />
          </div>
        </div>

        {/* Login card */}
        <div className="flex-1">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl mx-auto">
            <div className="absolute -top-6 right-6 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-cyan-100">
              Acesso seguro
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Entrar</p>
              <h2 className="text-2xl font-semibold">Bem-vindo de volta</h2>
              <p className="text-sm text-gray-300/80">
                Use suas credenciais para acessar o painel. Admins verão ferramentas extras automaticamente.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Email</label>
                <input
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
                />
              </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-white font-semibold shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>

        {needsTwoFactor && (
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Código 2FA</label>
            <input
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Digite o código"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
            />
          </div>
        )}

            {message && <p className="mt-4 text-sm text-cyan-100">{message}</p>}

            <div className="mt-6 flex items-center justify-between text-sm text-gray-300/80">
              <span>Não tem conta?</span>
              <a className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline" href="/register">
                Criar conta
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/20">
      <p className="text-xs uppercase tracking-wide text-gray-300/70">{title}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  )
}





