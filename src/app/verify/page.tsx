"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [phoneCode, setPhoneCode] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null)
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile")
        const text = await res.text()
        const data = text ? JSON.parse(text) : null
        if (data?.user) {
          setEmail(data.user.email)
          setPhone(data.user.phone || null)
          setEmailVerifiedAt(data.user.emailVerifiedAt || null)
          setPhoneVerifiedAt(data.user.phoneVerifiedAt || null)
        } else if (data?.message) {
          setMessage(data.message)
        }
      } catch (err) {
        console.error(err)
        setMessage("Faça login para verificar sua conta.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const requestEmail = async () => {
    const res = await fetch("/api/verify/email/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    setMessage(data.message || "Código enviado")
  }

  const confirmEmail = async (e: FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/verify/email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: emailCode }),
    })
    const data = await res.json()
    setMessage(data.message || "Email verificado")
  }

  const requestPhone = async () => {
    const res = await fetch("/api/verify/phone/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    setMessage(data.message || "Código enviado")
  }

  const confirmPhone = async (e: FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/verify/phone/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: phoneCode }),
    })
    const data = await res.json()
    setMessage(data.message || "Telefone verificado")
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Verificação</p>
          <h1 className="text-3xl font-semibold">Proteja sua conta</h1>
          <p className="text-gray-300/80">Verifique email e telefone para liberar o acesso completo.</p>
        </div>

        {loading ? (
          <p className="text-gray-300">Carregando...</p>
        ) : (
          <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Email da conta</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-200/80">Telefone</label>
            <input
              type="tel"
              value={phone || ""}
              readOnly
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={requestEmail} className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold">
              Enviar código email
            </button>
            <button onClick={requestPhone} className="rounded-lg border border-white/15 px-4 py-2 text-gray-100">
              Enviar código SMS
            </button>
          </div>
          </div>
        )}

        <form className="flex flex-col gap-3" onSubmit={confirmEmail}>
          <label className="text-sm text-gray-200/80">Código do email</label>
          <input
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
          />
          <button type="submit" className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold">
            Confirmar email
          </button>
          {emailVerifiedAt && <p className="text-emerald-300 text-sm">Email verificado</p>}
        </form>

        <form className="flex flex-col gap-3" onSubmit={confirmPhone}>
          <label className="text-sm text-gray-200/80">Código do telefone</label>
          <input
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white"
          />
          <button type="submit" className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold">
            Confirmar telefone
          </button>
          {phoneVerifiedAt && <p className="text-emerald-300 text-sm">Telefone verificado</p>}
        </form>

        {message && <p className="text-sm text-cyan-100">{message}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-white/15 px-4 py-2 text-gray-100"
          >
            Ir para dashboard
          </button>
          {!email && (
            <button
              onClick={() => router.push("/login")}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-white font-semibold"
            >
              Fazer login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}




