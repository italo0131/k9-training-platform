import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiRoot } from "@/app/api/_auth"
import { logAudit } from "@/lib/audit"
import { sendRejectionEmail } from "@/lib/email"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireApiRoot()
  if (error) return error

  const id = params.id
  const data = await req.json().catch(() => ({}))
  const reason = data.reason || "Não aprovado"

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: "SUSPENDED",
        suspendedAt: new Date(),
      },
    })

    await sendRejectionEmail(id, reason)

    await logAudit({
      actorId: session.user.id,
      action: "USER_REJECT",
      targetType: "user",
      targetId: id,
      metadata: { reason },
    })

    const { password, ...safe } = user
    return NextResponse.json({ success: true, user: safe })
  } catch (err) {
    console.error("ERRO REJECT USER:", err)
    return NextResponse.json({ success: false, message: "Erro ao rejeitar" }, { status: 500 })
  }
}
