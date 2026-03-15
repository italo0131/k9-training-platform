import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiUser } from "../../_auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser()
  if (error) return error
  const thread = await prisma.forumThread.findUnique({
    where: { id: params.id },
    include: { author: true, replies: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  })

  if (!thread) {
    return NextResponse.json({ success: false, message: "Tópico não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true, thread })
}
