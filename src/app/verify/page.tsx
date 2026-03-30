"use client"

import Link from "next/link"
import { type FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAppToast } from "@/app/components/AppToastProvider"
import { usePlatformSession } from "@/app/components/PlatformSessionProvider"
import Skeleton from "@/app/components/ui/Skeleton"
import { getAccountPlanLabel } from "@/lib/platform"

type ProfilePayload = {
  message?: string
  user?: {
    email?: string
    phone?: string | null
    plan?: string | null
    planStatus?: string | null
    emailVerifiedAt?: string | null
    phoneVerifiedAt?: string | null
  }
  stats?: {
    dogs?: number
  }
}

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status: sessionStatus, refreshSession } = usePlatformSession()
  const { pushToast } = useAppToast()

  const [email, setEmail] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [phoneCode, setPhoneCode] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [requestingEmail, setRequestingEmail] = useState(false)
  const [requestingPhone, setRequestingPhone] = useState(false)
  const [confirmingEmail, setConfirmingEmail] = useState(false)
  const [confirmingPhone, setConfirmingPhone] = useState(false)
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null)
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [planCode, setPlanCode] = useState("FREE")
  const [planStatus, setPlanStatus] = useState("ACTIVE")
  const [dogsCount, setDogsCount] = useState(0)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [phoneCooldown, setPhoneCooldown] = useState(0)

  const nextStep = searchParams.get("next")
  const selectedPlan = searchParams.get("plan")
  const emailCodeFromUrl = (searchParams.get("emailCode") || searchParams.get("code") || "").trim()
  const shouldAutoConfirm = searchParams.get("auto") === "1" || !!emailCodeFromUrl
  const effectivePlan = String(selectedPlan || planCode || "FREE").toUpperCase()
  const needsBilling = !!emailVerifiedAt && effectivePlan !== "FREE" && planStatus !== "ACTIVE"
  const shouldCreateFirstDog = !!emailVerifiedAt && !needsBilling && dogsCount === 0
  const primaryJourneyHref = !emailVerifiedAt
    ? "/verify#email-code"
    : needsBilling
      ? "/billing"
      : shouldCreateFirstDog
        ? "/dogs/new"
        : "/dashboard"
  const primaryJourneyLabel = !emailVerifiedAt
    ? "Confirmar email"
    : needsBilling
      ? `Continuar para assinatura ${getAccountPlanLabel(effectivePlan)}`
      : shouldCreateFirstDog
        ? "Cadastrar meu primeiro cao"
        : "Ir para o dashboard"
  const journeyDescription = !emailVerifiedAt
    ? "A primeira liberacao real da conta acontece quando o email e confirmado."
    : needsBilling
      ? "Com o email confirmado, falta so concluir a assinatura para liberar toda a experiencia."
      : shouldCreateFirstDog
        ? "Sua conta ja esta pronta. Agora vale cadastrar o primeiro cao para personalizar o resto da jornada."
        : "Conta validada e pronta para seguir com treinos, conteudos, agenda e comunidade."

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile")
        const text = await res.text()
        const data = (text ? JSON.parse(text) : null) as ProfilePayload | null

        if (data?.user) {
          setEmail(String(data.user.email || ""))
          setPhone(data.user.phone || null)
          setEmailVerifiedAt(data.user.emailVerifiedAt || null)
          setPhoneVerifiedAt(data.user.phoneVerifiedAt || null)
          setPlanCode(String(data.user.plan || "FREE").toUpperCase())
          setPlanStatus(String(data.user.planStatus || "ACTIVE").toUpperCase())
          setDogsCount(Number(data.stats?.dogs || 0))
          if (emailCodeFromUrl) {
            setEmailCode(emailCodeFromUrl)
          }
        } else if (data?.message) {
          setStatusNote(data.message)
        }
      } catch (error) {
        console.error(error)
        setStatusNote("Faca login para concluir a verificacao da sua conta com tranquilidade.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [emailCodeFromUrl])

  useEffect(() => {
    if (!shouldAutoConfirm || !emailCodeFromUrl) return
    if (loading || sessionStatus !== "authenticated" || emailVerifiedAt || confirmingEmail) return

    void confirmEmailCode(emailCodeFromUrl, true)
  }, [confirmingEmail, emailCodeFromUrl, emailVerifiedAt, loading, sessionStatus, shouldAutoConfirm])

  useEffect(() => {
    if (emailCooldown <= 0 && phoneCooldown <= 0) return

    const timer = window.setInterval(() => {
      setEmailCooldown((current) => Math.max(0, current - 1))
      setPhoneCooldown((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [emailCooldown, phoneCooldown])

  async function requestEmail() {
    setRequestingEmail(true)

    try {
      const res = await fetch("/api/verify/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => null)
      const retryAfter = Number(res.headers.get("Retry-After") || 60)
      const message = data?.message || "Enviamos um novo codigo para o seu email."

      setStatusNote(message)
      pushToast({
        title: res.ok ? "Codigo enviado" : "Nao foi possivel reenviar agora",
        description: message,
        variant: res.ok ? "success" : "error",
      })

      if (res.ok) {
        setEmailCooldown(60)
      } else if (res.status === 429) {
        setEmailCooldown(Math.max(10, retryAfter))
      }
    } catch (error) {
      console.error(error)
      const message = "Ops, algo deu errado ao reenviar o codigo. Tente novamente em instantes."
      setStatusNote(message)
      pushToast({ title: "Falha ao reenviar", description: message, variant: "error" })
    } finally {
      setRequestingEmail(false)
    }
  }

  async function confirmEmailCode(codeValue: string, autoTriggered = false) {
    const normalizedCode = codeValue.trim()
    if (!normalizedCode) {
      if (!autoTriggered) {
        const message = "Digite o codigo que enviamos por email para concluir esta etapa."
        setStatusNote(message)
        pushToast({ title: "Codigo necessario", description: message, variant: "info" })
      }
      return
    }

    setConfirmingEmail(true)
    try {
      const res = await fetch("/api/verify/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode }),
      })
      const data = await res.json().catch(() => null)
      const message = data?.message || "Seu email foi confirmado com sucesso."

      if (res.ok && data?.success) {
        setEmailVerifiedAt(new Date().toISOString())
        setEmailCode("")
        await refreshSession()
        router.refresh()
      }

      setStatusNote(message)
      pushToast({
        title: res.ok ? "Email confirmado" : "Nao consegui confirmar o email",
        description: message,
        variant: res.ok ? "success" : "error",
      })
    } catch (error) {
      console.error(error)
      const message = "Nao foi possivel confirmar o email agora. Tente novamente em alguns instantes."
      setStatusNote(message)
      pushToast({ title: "Falha na confirmacao", description: message, variant: "error" })
    } finally {
      setConfirmingEmail(false)
    }
  }

  async function requestPhone() {
    setRequestingPhone(true)
    try {
      const res = await fetch("/api/verify/phone/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json().catch(() => null)
      const retryAfter = Number(res.headers.get("Retry-After") || 60)
      const message = data?.message || "Se o envio por SMS estiver ativo, voce recebera um codigo em instantes."

      setStatusNote(message)
      pushToast({
        title: res.ok ? "Pedido de SMS enviado" : "Nao consegui enviar o SMS agora",
        description: message,
        variant: res.ok ? "success" : "error",
      })

      if (res.ok) {
        setPhoneCooldown(60)
      } else if (res.status === 429) {
        setPhoneCooldown(Math.max(10, retryAfter))
      }
    } catch (error) {
      console.error(error)
      const message = "O envio do SMS falhou agora. Tente novamente em alguns instantes."
      setStatusNote(message)
      pushToast({ title: "Falha no envio", description: message, variant: "error" })
    } finally {
      setRequestingPhone(false)
    }
  }

  async function confirmPhone(event: FormEvent) {
    event.preventDefault()

    if (!phoneCode.trim()) {
      const message = "Digite o codigo recebido por SMS para confirmar o telefone."
      setStatusNote(message)
      pushToast({ title: "Codigo necessario", description: message, variant: "info" })
      return
    }

    setConfirmingPhone(true)
    try {
      const res = await fetch("/api/verify/phone/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: phoneCode.trim() }),
      })
      const data = await res.json().catch(() => null)
      const message = data?.message || "Telefone confirmado com sucesso."

      if (res.ok && data?.success) {
        setPhoneVerifiedAt(new Date().toISOString())
        setPhoneCode("")
      }

      setStatusNote(message)
      pushToast({
        title: res.ok ? "Telefone confirmado" : "Nao consegui confirmar o telefone",
        description: message,
        variant: res.ok ? "success" : "error",
      })
    } catch (error) {
      console.error(error)
      const message = "Nao foi possivel confirmar o telefone agora. Tente novamente em alguns instantes."
      setStatusNote(message)
      pushToast({ title: "Falha na confirmacao", description: message, variant: "error" })
    } finally {
      setConfirmingPhone(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_24%),linear-gradient(145deg,#020617,#0f172a_55%,#020617)] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6 fade-in-up">
        <section className="surface-card rounded-[32px] p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Verificacao da conta</p>
              <h1 className="text-3xl font-semibold md:text-4xl">Vamos proteger sua conta com clareza e sem pressa.</h1>
              <p className="max-w-3xl text-slate-300 leading-7">
                Confirmar email e telefone ajuda a manter a plataforma mais segura para tutores, profissionais e equipe.
                Essa etapa nao e um julgamento sobre voce; e so uma camada extra de cuidado.
              </p>
            </div>

            {selectedPlan ? (
              <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-50">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Plano escolhido</p>
                <p className="mt-2 text-xl font-semibold">{getAccountPlanLabel(selectedPlan)}</p>
                <p className="mt-2 max-w-xs text-emerald-50/90">Depois da verificacao, seguimos para liberar a experiencia do seu plano.</p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
            <p className="font-semibold text-white">Transparencia</p>
            <p className="mt-2">
              Sempre que a plataforma usar automacao ou IA para orientar proximos passos, isso sera sinalizado para voce.
              A decisao final continua nas maos do tutor ou responsavel.
            </p>
          </div>
        </section>

        {loading ? (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="surface-card rounded-[28px] p-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-6 h-11 w-full rounded-[18px]" />
            </div>
            <div className="surface-card rounded-[28px] p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-6 w-2/3" />
              <Skeleton className="mt-6 h-11 w-full rounded-[18px]" />
            </div>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            <StatusCard
              title="Email"
              value={email || "Nao carregado"}
              verified={!!emailVerifiedAt}
              actionLabel={requestingEmail ? "Enviando..." : emailCooldown > 0 ? `Reenviar em ${emailCooldown}s` : "Reenviar codigo por email"}
              helperText="Enviamos um codigo curto para liberar o acesso completo com mais seguranca."
              onAction={requestEmail}
              disabled={requestingEmail || emailCooldown > 0 || !!emailVerifiedAt}
            />
            <StatusCard
              title="Telefone"
              value={phone || "Ainda nao informado"}
              verified={!!phoneVerifiedAt}
              actionLabel={requestingPhone ? "Enviando..." : phoneCooldown > 0 ? `Reenviar em ${phoneCooldown}s` : "Enviar codigo por SMS"}
              helperText={phone ? "Se o SMS estiver habilitado, voce recebe um codigo para confirmar este numero." : "Se quiser validar o telefone, primeiro cadastre um numero no seu perfil."}
              onAction={requestPhone}
              disabled={requestingPhone || phoneCooldown > 0 || !phone || !!phoneVerifiedAt}
              secondaryHref={!phone ? "/profile/edit" : undefined}
              secondaryLabel={!phone ? "Adicionar telefone" : undefined}
            />
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <JourneyCard
            step="01"
            title="Conta criada"
            description="Seu acesso ja existe e a sessao esta pronta para seguir."
            complete
          />
          <JourneyCard
            step="02"
            title="Email protegido"
            description="Essa etapa libera a conta com mais confianca."
            complete={!!emailVerifiedAt}
          />
          <JourneyCard
            step="03"
            title={effectivePlan === "FREE" ? "Plano Free ativo" : `Plano ${getAccountPlanLabel(effectivePlan)}`}
            description={effectivePlan === "FREE" ? "No Free voce ja pode comecar." : "Plano pago precisa de checkout concluido para ficar ativo."}
            complete={effectivePlan === "FREE" || planStatus === "ACTIVE"}
          />
          <JourneyCard
            step="04"
            title="Primeiro cao"
            description="Com o primeiro cao cadastrado, a plataforma fica muito mais personalizada."
            complete={dogsCount > 0}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <form className="surface-card rounded-[28px] p-6" onSubmit={(event) => {
            event.preventDefault()
            void confirmEmailCode(emailCode)
          }}>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Confirmar email</p>
            <h2 className="mt-2 text-2xl font-semibold">Cole o codigo que chegou na sua caixa de entrada</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Se nao encontrar, vale conferir spam ou promocoes. Se preferir, voce pode pedir um novo codigo logo acima.
            </p>
            <label htmlFor="email-code" className="mt-5 block text-sm text-slate-200/90">
              Codigo do email
            </label>
            <input
              id="email-code"
              value={emailCode}
              onChange={(event) => setEmailCode(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400"
              placeholder="Digite o codigo recebido"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <button
              type="submit"
              disabled={confirmingEmail || !!emailVerifiedAt}
              className="interactive-button mt-4 rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#10b981)] px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {emailVerifiedAt ? "Email ja confirmado" : confirmingEmail ? "Confirmando com seguranca..." : "Confirmar meu email"}
            </button>
          </form>

          <form className="surface-card rounded-[28px] p-6" onSubmit={confirmPhone}>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Confirmar telefone</p>
            <h2 className="mt-2 text-2xl font-semibold">Confirme seu numero se quiser reforcar a recuperacao da conta</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Essa etapa e opcional quando o SMS ainda nao estiver configurado, mas ela ajuda bastante na seguranca e nos lembretes.
            </p>
            <label htmlFor="phone-code" className="mt-5 block text-sm text-slate-200/90">
              Codigo do telefone
            </label>
            <input
              id="phone-code"
              value={phoneCode}
              onChange={(event) => setPhoneCode(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400"
              placeholder="Digite o codigo recebido por SMS"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <button
              type="submit"
              disabled={confirmingPhone || !!phoneVerifiedAt}
              className="interactive-button mt-4 rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {phoneVerifiedAt ? "Telefone ja confirmado" : confirmingPhone ? "Confirmando..." : "Confirmar meu telefone"}
            </button>
          </form>
        </section>

        {statusNote ? (
          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-500/10 p-4 text-sm leading-7 text-cyan-50">
            {statusNote}
          </div>
        ) : null}

        {sessionStatus === "unauthenticated" ? (
          <div className="rounded-[28px] border border-amber-300/20 bg-amber-500/10 p-6 text-amber-50">
            Faca login para concluir a verificacao e liberar os recursos da sua conta com mais seguranca.
          </div>
        ) : null}

        <section className="surface-card rounded-[28px] p-6">
          <div className="mb-5 rounded-[24px] border border-emerald-300/15 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Proximo passo guiado</p>
            <p className="mt-2 text-xl font-semibold text-white">{primaryJourneyLabel}</p>
            <p className="mt-2 text-sm leading-7 text-emerald-50/90">{journeyDescription}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {emailVerifiedAt && (nextStep === "billing" || needsBilling) ? (
              <button
                onClick={() => router.push("/billing")}
                className="interactive-button rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#10b981)] px-4 py-3 font-semibold text-white"
              >
                Seguir para assinatura
              </button>
            ) : (
              <button
                onClick={() => router.push(primaryJourneyHref)}
                className="interactive-button rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#10b981)] px-4 py-3 font-semibold text-white"
              >
                {primaryJourneyLabel}
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="interactive-button rounded-2xl border border-white/15 px-4 py-3 text-gray-100"
            >
              Ir para o dashboard
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="interactive-button rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-cyan-100"
            >
              Ver meu perfil
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Se preferir ajustar telefone ou outros dados antes, voce tambem pode seguir para o <Link href="/profile/edit" className="text-cyan-200 underline underline-offset-4">perfil</Link> e voltar aqui depois.
          </p>
        </section>
      </div>
    </div>
  )
}

function StatusCard({
  title,
  value,
  verified,
  actionLabel,
  helperText,
  onAction,
  disabled = false,
  secondaryHref,
  secondaryLabel,
}: {
  title: string
  value: string
  verified: boolean
  actionLabel: string
  helperText: string
  onAction: () => void
  disabled?: boolean
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <div className="surface-card interactive-card rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">{title}</p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
      <p className={`mt-2 text-sm ${verified ? "text-emerald-200" : "text-amber-200"}`}>
        {verified ? "Tudo certo por aqui" : "Ainda pendente"}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{helperText}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="interactive-button rounded-2xl border border-white/15 px-4 py-3 text-sm text-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLabel}
        </button>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="interactive-button rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

function JourneyCard({
  step,
  title,
  description,
  complete,
}: {
  step: string
  title: string
  description: string
  complete?: boolean
}) {
  return (
    <div className={`rounded-[24px] border p-5 ${complete ? "border-emerald-300/20 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Etapa {step}</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      <p className={`mt-3 text-xs uppercase tracking-[0.2em] ${complete ? "text-emerald-100" : "text-amber-200"}`}>
        {complete ? "Concluida" : "Em andamento"}
      </p>
    </div>
  )
}
