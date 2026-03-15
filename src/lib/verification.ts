import { prisma } from "@/lib/prisma"

export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createVerificationCode(userId: string, type: "email" | "phone" | "2fa") {
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await prisma.verificationCode.create({
    data: { userId, type, code, expiresAt },
  })
  return code
}

export async function verifyCode(userId: string, type: "email" | "phone" | "2fa", code: string) {
  const record = await prisma.verificationCode.findFirst({
    where: { userId, type, code, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: "desc" },
  })
  if (!record) return false
  await prisma.verificationCode.delete({ where: { id: record.id } })
  return true
}
