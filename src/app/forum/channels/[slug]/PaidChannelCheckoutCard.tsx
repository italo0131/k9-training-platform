"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Props = {
  channelId: string
  channelSlug: string
  initialStatus?: string | null
  hasPremiumAccess: boolean
  upgradeHref: string
  providerLabel: string
}

export default function PaidChannelCheckoutCard({
  channelId,
  channelSlug,
  initialStatus,
  hasPremiumAccess,
  upgradeHref,
  providerLabel,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(String(initialStatus || "").toUpperCase())
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const isActive = status === "ACTIVE"
  const isPending = status === "PENDING_PAYMENT" || status === "CHECKOUT_PENDING"

  async function handleCreateRequest() {
    if (!hasPremiumAccess) {
      router.push(upgradeHref)
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`/api/forum/channels/${channelId}/subscription`, {
        method: "POST",
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        setMessage(data?.message || "Nao foi possivel preparar a assinatura")
        return
      }

      setStatus(String(data?.subscription?.status || data?.mode || "PENDING_PAYMENT").toUpperCase())
      if (data?.url) {
        window.location.href = data.url
        return
      }

      setMessage(data?.message || `Assinatura preparada. O passo seguinte e concluir a cobranca pelo ${providerLabel}.`)
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage("Erro ao preparar assinatura")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`/api/forum/channels/${channelId}/subscription`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        setMessage(data?.message || "Nao foi possivel cancelar a assinatura")
        return
      }

      setStatus(String(data?.subscription?.status || "CANCELED").toUpperCase())
      setMessage(data?.message || "Assinatura cancelada.")
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage("Erro ao cancelar assinatura")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/30">
      <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-200/80">Assinatura do canal</p>
      <h2 className="mt-3 text-2xl font-semibold">
        {!hasPremiumAccess
          ? "Seu plano ainda nao libera a assinatura deste canal"
          : isActive
            ? "Sua assinatura esta ativa"
            : isPending
              ? "Checkout pendente"
              : "Preparar assinatura do canal"}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        {!hasPremiumAccess
          ? "Primeiro ative o plano Standard ou o acesso profissional. Depois voce escolhe o canal pago e acompanha o status da cobranca."
          : isActive
            ? "Este canal ja esta ligado ao seu perfil. O conteudo interno e o mural fechado ficam liberados para sua conta."
            : isPending
              ? `Sua solicitacao ja foi criada. Finalize o pagamento no ${providerLabel} para transformar esse checkout em acesso ativo.`
              : `Aqui voce revisa o valor do canal e segue para o checkout real pelo ${providerLabel}.`}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {!hasPremiumAccess ? (
          <Link
            href={upgradeHref}
            className="rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#f97316)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20"
          >
            Ativar Standard
          </Link>
        ) : isPending ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cancelando..." : "Cancelar solicitacao"}
            </button>
            <Link
              href={`/forum/channels/${channelSlug}`}
              className="rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#8b5cf6)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20"
            >
              Voltar ao canal
            </Link>
          </>
        ) : isActive ? (
          <>
            <Link
              href={`/forum/channels/${channelSlug}`}
              className="rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#10b981)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20"
            >
              Abrir canal
            </Link>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cancelando..." : "Cancelar assinatura"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCreateRequest}
              disabled={loading}
              className="rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#8b5cf6)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Abrindo checkout..." : "Assinar canal"}
            </button>
            <Link
              href={`/forum/channels/${channelSlug}`}
              className="rounded-2xl border border-white/15 px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              Voltar ao canal
            </Link>
          </>
        )}
      </div>

      {message ? <p className="mt-4 text-xs text-cyan-100">{message}</p> : null}
    </div>
  )
}
