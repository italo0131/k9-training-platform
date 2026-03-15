import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"
import { requireApiUser } from "../../_auth"

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ success: false, message: "Stripe não configurado" }, { status: 500 })
  }

  try {
    const { session: authSession, error } = await requireApiUser()
    if (error) return error

    const body = await req.json()
    const priceId = body.priceId || process.env.STRIPE_PRICE_ID

    if (!priceId) {
      return NextResponse.json({ success: false, message: "priceId não informado" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: authSession.user.email,
      client_reference_id: authSession.user.id,
      metadata: { userId: authSession.user.id },
      success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/billing?status=success",
      cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:3000/billing?status=cancel",
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (error) {
    console.error("ERRO CHECKOUT STRIPE:", error)
    return NextResponse.json({ success: false, message: "Erro ao criar checkout" }, { status: 500 })
  }
}
