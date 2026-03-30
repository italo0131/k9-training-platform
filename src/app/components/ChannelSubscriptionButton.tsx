"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  channelId: string
  channelSlug: string
  channelName: string
  subscriptionPrice?: number | null
  initialStatus?: string | null
  isOwner: boolean
  hasPremiumAccess: boolean
  upgradeHref?: string
}

export default function ChannelSubscriptionButton({
  channelId,
  channelSlug,
  channelName,
  subscriptionPrice = 0,
  initialStatus,
  isOwner,
  hasPremiumAccess,
  upgradeHref = "/billing?locked=/forum",
}: Props) {
  const router = useRouter()
  const normalizedInitialStatus = String(initialStatus || "").toUpperCase()
  const [status, setStatus] = useState(normalizedInitialStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const paidPrice = subscriptionPrice || 0
  const isPaidChannel = paidPrice > 0
  const subscribed = status === "ACTIVE"
  const pending = status === "PENDING_PAYMENT" || status === "CHECKOUT_PENDING"

  const handleToggle = async () => {
    if (isOwner) return
    if (!hasPremiumAccess) {
      router.push(upgradeHref)
      return
    }
    if (isPaidChannel) {
      router.push(`/forum/channels/${channelSlug}/assinar`)
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`/api/forum/channels/${channelId}/subscription`, {
        method: subscribed ? "DELETE" : "POST",
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        setMessage(data?.message || "Nao foi possivel atualizar a assinatura")
        return
      }

      const nextStatus = data?.subscription?.status ? String(data.subscription.status).toUpperCase() : subscribed ? "CANCELED" : "ACTIVE"
      setStatus(nextStatus)
      setMessage(data?.message || (subscribed ? "Canal removido da sua area de conteudo." : "Canal adicionado a sua area de conteudo."))
      router.refresh()
    } catch (error) {
      console.error(error)
      setMessage("Erro ao atualizar assinatura")
    } finally {
      setLoading(false)
    }
  }

  if (isOwner) {
    return (
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
        Voce administra este canal.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          !hasPremiumAccess
            ? "bg-[linear-gradient(135deg,#f59e0b,#f97316)] text-white shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
            : isPaidChannel
              ? "bg-[linear-gradient(135deg,#06b6d4,#8b5cf6)] text-white shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5"
            : subscribed
            ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
            : "bg-[linear-gradient(135deg,#06b6d4,#10b981)] text-white shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {loading
          ? "Atualizando..."
          : !hasPremiumAccess
            ? "Ativar Standard"
            : isPaidChannel
              ? pending
                ? "Ver checkout pendente"
                : subscribed
                  ? "Gerenciar assinatura"
                  : "Ver assinatura do canal"
              : subscribed
                ? "Sair do canal"
                : "Entrar no canal"}
      </button>
      {!hasPremiumAccess && (
        <p className="text-xs text-amber-100">Seu plano atual permite conhecer o canal, mas a assinatura fica nos planos pagos.</p>
      )}
      {hasPremiumAccess && isPaidChannel ? (
        <p className="text-xs text-cyan-100">
          {pending
            ? `O checkout de ${channelName} esta em preparo e o acesso ainda depende da confirmacao financeira.`
            : `Canal com assinatura propria. Abra o fluxo para revisar valor, beneficios e status.`}
        </p>
      ) : null}
      {message && <p className="text-xs text-cyan-100">{message}</p>}
    </div>
  )
}
