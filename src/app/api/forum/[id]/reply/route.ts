import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiUser } from "../../../_auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireApiUser()
  if (error) return error

  const data = await req.json()
  const content = String(data?.content || "").trim()
  if (!content) {
    return NextResponse.json({ success: false, message: "Conteúdo obrigatório" }, { status: 400 })
  }
  if (content.length < 5 || content.length > 1200) {
    return NextResponse.json({ success: false, message: "Resposta deve ter entre 5 e 1200 caracteres" }, { status: 400 })
  }

  // limite: até 20 respostas por 10 minutos
  const windowStart = new Date(Date.now() - 10 * 60 * 1000)
  const recentCount = await prisma.forumReply.count({
    where: { authorId: session.user.id, createdAt: { gte: windowStart } },
  })
  if (recentCount >= 20) {
    return NextResponse.json({ success: false, message: "Limite temporário atingido. Tente novamente em alguns minutos." }, { status: 429 })
  }

  const reply = await prisma.forumReply.create({
    data: {
      content,
      authorId: session.user.id,
      threadId: params.id,
    },
  })

  return NextResponse.json({ success: true, reply }, { status: 201 })
}
