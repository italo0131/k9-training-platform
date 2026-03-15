import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"
import BillingClient from "./BillingClient"

export default async function BillingPage() {
  const session = await requireUser()

  const plans = [
    {
      name: "Starter",
      price: "R$ 79/mes",
      description: "Ate 20 caes, agendamentos basicos, relatorios simples.",
      priceId: process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_ID || null,
    },
    {
      name: "Pro",
      price: "R$ 149/mes",
      description: "Caes ilimitados, calendario completo, graficos e exportacao.",
      priceId: process.env.STRIPE_PRICE_ID_PRO || null,
    },
  ]

  const payments = await prisma.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const lastEvent = payments[0]
  const totalPaid = payments
    .filter((p) => ["paid", "succeeded"].includes((p.status || "").toLowerCase()))
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const subscriptionStatus = lastEvent?.status || "sem eventos"

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Assinatura</p>
          <h1 className="text-3xl font-semibold">Planos para seu centro de treinamento</h1>
          <p className="text-gray-300/80">Dados reais do Stripe para sua conta.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-300">Status atual</p>
            <p className="text-2xl font-semibold mt-1">{subscriptionStatus}</p>
            <p className="text-xs text-gray-400 mt-2">
              Ultimo evento: {lastEvent ? lastEvent.type : "nenhum"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-300">Total pago (centavos)</p>
            <p className="text-2xl font-semibold mt-1">{totalPaid}</p>
            <p className="text-xs text-gray-400 mt-2">Eventos listados: {payments.length}</p>
          </div>
        </div>

        <BillingClient plans={plans} />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-200">
          <p>Configuracao necessaria (.env):</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
            <li>STRIPE_SECRET_KEY</li>
            <li>STRIPE_PRICE_ID_STARTER (ou STRIPE_PRICE_ID)</li>
            <li>STRIPE_PRICE_ID_PRO (opcional)</li>
            <li>STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL</li>
            <li>STRIPE_WEBHOOK_SECRET</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
