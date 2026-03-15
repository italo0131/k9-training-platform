import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isAdminRole } from "@/lib/role"
import { requireApiUser } from "../_auth"

export async function GET() {
  const { session, error } = await requireApiUser()
  if (error) return error

  try {
    const where = isAdminRole(session.user.role) ? {} : { ownerId: session.user.id }

    const dogs = await prisma.dog.findMany({
      where,
      include: { owner: true, trainings: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(dogs)
  } catch (error) {
    console.error("ERRO API GET /dogs:", error)
    return NextResponse.json({ success: false, message: "Erro ao listar cães" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireApiUser()
  if (error) return error

  try {
    const data = await req.json()

    if (!data?.name || !data?.breed || !data?.age) {
      return NextResponse.json({ success: false, message: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const ownerId = isAdminRole(session.user.role) && data.ownerId ? data.ownerId : session.user.id

    // se não for admin, garanta que ownerId é o próprio usuário
    if (!isAdminRole(session.user.role) && data.ownerId && data.ownerId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Sem permissão para atribuir outro tutor" }, { status: 403 })
    }

    const dog = await prisma.dog.create({
      data: {
        name: data.name,
        breed: data.breed,
        age: Number(data.age),
        ownerId,
      },
    })

    return NextResponse.json({ success: true, dog }, { status: 201 })
  } catch (error) {
    console.error("ERRO API POST /dogs:", error)
    return NextResponse.json({ success: false, message: "Erro ao salvar cão" }, { status: 500 })
  }
}
