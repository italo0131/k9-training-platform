"use client"

import { useState } from "react"

type Plan = {
  name: string
  price: string
  description: string
  priceId?: string | null
}

export default function BillingClient({ plans }: { plans: Plan[] }) {
  const [message, setMessage] = useState("")
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscribe = async (plan: Plan) => {
    if (!plan.priceId) {
      setMessage("Plano sem priceId configurado no servidor.")
      return
    }
    setLoadingPlan(plan.name)
    setMessage("")
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.url) {
        setMessage(data.message || "Nao foi possivel iniciar o checkout")
        return
      }
      window.location.href = data.url
    } catch (err) {
      console.error("Erro checkout", err)
      setMessage("Erro ao iniciar checkout")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                <p className="text-gray-300">{plan.description}</p>
              </div>
              <p className="text-xl font-semibold text-cyan-300">{plan.price}</p>
            </div>
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={!!loadingPlan}
              className="w-full rounded-lg bg-cyan-500 px-4 py-3 text-white font-semibold hover:-translate-y-0.5 transition shadow-lg shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === plan.name ? "Redirecionando..." : "Assinar com Stripe"}
            </button>
          </div>
        ))}
      </div>

      {message && <p className="text-sm text-cyan-100">{message}</p>}
    </div>
  )
}
