import { NextResponse } from "next/server"
import { randomBytes, scryptSync } from "crypto"

import { prisma } from "@/lib/prisma"
import { sendVerifyEmail } from "@/lib/email"
import { createVerificationCode } from "@/lib/verification"
import { ACCOUNT_PLANS, REGISTERABLE_ROLES, isPaidPlan } from "@/lib/platform"
import { isProfessionalRole } from "@/lib/role"
import {
  coerceNonNegativeInteger,
  getPasswordValidationError,
  normalizeEmailInput,
  normalizeTextInput,
  normalizeUrlInput,
  rejectIfCrossOrigin,
  rejectIfRateLimited,
} from "@/lib/security"

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derived = scryptSync(password, salt, 64).toString("hex")
  return `scrypt:${salt}:${derived}`
}

function isDatabaseUnavailableError(error: unknown) {
  if (!error || typeof error !== "object") return false

  const candidate = error as { code?: string; name?: string; message?: string }
  if (candidate.code === "P1001") return true
  if (candidate.name === "PrismaClientInitializationError") return true
  return String(candidate.message || "").includes("Can't reach database server")
}

export async function POST(req: Request) {
  try {
    const crossOriginError = rejectIfCrossOrigin(req)
    if (crossOriginError) return crossOriginError

    const rateLimitError = rejectIfRateLimited(
      req,
      "register",
      12,
      15 * 60 * 1000,
      "Muitas tentativas de cadastro em pouco tempo. Aguarde alguns minutos antes de tentar novamente.",
    )
    if (rateLimitError) return rateLimitError

    const data = await req.json()
    const name = normalizeTextInput(data?.name, 120)
    const email = normalizeEmailInput(data?.email)
    const passwordError = getPasswordValidationError(data?.password)

    if (!name || !email || passwordError) {
      return NextResponse.json(
        { success: false, message: passwordError || "Nome, email e senha sao os primeiros dados que precisamos para criar sua conta." },
        { status: 400 },
      )
    }

    const hashedPassword = hashPassword(data.password)
    const requestedRole = String(normalizeTextInput(data?.role, 20) || "CLIENT").toUpperCase()
    const requestedPlan = String(normalizeTextInput(data?.plan, 32) || "FREE").toUpperCase()
    const requiresProfessionalApproval = isProfessionalRole(requestedRole)

    if (!REGISTERABLE_ROLES.includes(requestedRole as (typeof REGISTERABLE_ROLES)[number])) {
      return NextResponse.json({ success: false, message: "Esse tipo de conta nao esta disponivel para cadastro publico." }, { status: 400 })
    }

    if (!ACCOUNT_PLANS.includes(requestedPlan as (typeof ACCOUNT_PLANS)[number])) {
      return NextResponse.json({ success: false, message: "Nao reconheci o plano escolhido. Tente novamente." }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: requestedRole,
        plan: requestedPlan,
        planStatus: isPaidPlan(requestedPlan) ? "CHECKOUT_REQUIRED" : "ACTIVE",
        planActivatedAt: isPaidPlan(requestedPlan) ? null : new Date(),
        phone: normalizeTextInput(data.phone, 32),
        city: normalizeTextInput(data.city, 80),
        state: normalizeTextInput(data.state, 80),
        headline: normalizeTextInput(data.headline, 140),
        bio: normalizeTextInput(data.bio, 600),
        specialties: normalizeTextInput(data.specialties, 240),
        experienceYears: coerceNonNegativeInteger(data.experienceYears, 80),
        availabilityNotes: normalizeTextInput(data.availabilityNotes, 500),
        websiteUrl: normalizeUrlInput(data.websiteUrl, 240),
        instagramHandle: normalizeTextInput(data.instagramHandle, 80),
        status: requiresProfessionalApproval ? "PENDING_APPROVAL" : "ACTIVE",
      },
    })

    const emailCode = await createVerificationCode(user.id, "email")
    let emailDeliveryFailed = false
    try {
      await sendVerifyEmail(user.id, emailCode)
    } catch (emailError) {
      emailDeliveryFailed = true
      console.warn("Nao foi possivel enviar o email de verificacao automaticamente.", emailError)
      console.log(`[verify-email] ${user.email} code=${emailCode}`)
    }

    if (data.phone) {
      const phoneCode = await createVerificationCode(user.id, "phone")
      console.log(`[verify-phone] ${data.phone} code=${phoneCode}`)
    }

    const safeUser = Object.fromEntries(Object.entries(user).filter(([key]) => key !== "password"))

    return NextResponse.json(
      {
        success: true,
        user: safeUser,
        emailDeliveryFailed,
        message: emailDeliveryFailed
          ? "Conta criada com sucesso, mas o email de confirmacao nao saiu agora. Revise o remetente no provedor e tente reenviar pela tela de verificacao."
          : requiresProfessionalApproval
            ? "Conta criada com sucesso. Depois da confirmacao de email, seu perfil profissional vai para analise da equipe."
          : isPaidPlan(requestedPlan)
            ? "Conta criada com sucesso. Vamos confirmar seu email e depois seguir para a assinatura do plano escolhido."
            : "Conta criada com sucesso. Enviamos um codigo para o seu email para liberar a experiencia completa.",
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error("ERRO API POST /register:", error)

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ success: false, message: "Ja existe uma conta com esse email. Se ela for sua, voce pode entrar ou recuperar o acesso." }, { status: 409 })
    }

    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "O banco de dados nao esta acessivel agora. Se voce estiver rodando localmente, confirme se o Postgres esta ativo e se o DATABASE_URL aponta para localhost:5432 fora do Docker.",
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ success: false, message: "Ops, algo deu errado ao criar sua conta. Tente novamente em alguns instantes." }, { status: 500 })
  }
}
