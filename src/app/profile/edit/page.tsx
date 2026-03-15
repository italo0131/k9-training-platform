"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type UserProfile = {
  id: string
  name: string
  email: string
  phone?: string | null
  emailVerifiedAt?: string | null
  phoneVerifiedAt?: string | null
  twoFactorEnabled?: boolean
}

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        const text = await res.text()
        const data = text ? JSON.parse(text) : null
        if (!res.ok || !data?.success) {
          setMessage(data?.message || "Não foi possível carregar o perfil")
          return
        }
        setUser(data.user)
        setName(data.user.name)
        setEmail(data.user.email)
        setPhone(data.user.phone || "")
        setTwoFactorEnabled(!!data.user.twoFactorEnabled)
      })
      .catch((err) => {
        console.error("Erro carregando perfil", err)
        setMessage("Erro ao carregar perfil")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPassword && newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem")
      return
    }

    const wantsEmailChange = email !== user?.email
    const wantsPasswordChange = !!newPassword
    if ((wantsEmailChange || wantsPasswordChange) && !currentPassword) {
      setMessage("Informe a senha atual para alterar email ou senha")
      return
    }

    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          twoFactorEnabled,
          password: newPassword || undefined,
          currentPassword: currentPassword || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setMessage(data.message || "Erro ao salvar")
        return
      }

      setMessage("Dados atualizados com sucesso")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      router.refresh()
      router.push("/profile")
    } catch (err) {
      console.error("Erro ao salvar perfil", err)
      setMessage("Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Perfil</p>
          <h1 className="text-2xl font-semibold text-white">Gerenciar perfil</h1>
          <p className="text-sm text-gray-300/80">Atualize seus dados. A senha é opcional.</p>
        </div>

        {loading ? (
          <p className="text-gray-300">Carregando...</p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-200/80">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-200/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-200/80">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-200/80">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              />
              Ativar 2FA por código no email
            </label>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-200/80">Senha atual (obrigatória para alterar email/senha)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Nova senha (opcional)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Preencha para trocar a senha"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-200/80">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white placeholder:text-gray-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="rounded-lg border border-white/15 px-4 py-3 text-gray-100 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-cyan-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-cyan-100">{message}</p>}
      </div>
    </div>
  )
}


