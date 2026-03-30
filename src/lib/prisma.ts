import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

function resolveDatasourceUrl() {
  const rawUrl = String(process.env.DATABASE_URL || "").trim()
  if (!rawUrl) return undefined

  const explicitDevUrl = String(process.env.DATABASE_URL_DEV || "").trim()
  if (explicitDevUrl && process.env.NODE_ENV !== "production") {
    return explicitDevUrl
  }

  if (process.env.NODE_ENV === "production") {
    return rawUrl
  }

  try {
    const parsed = new URL(rawUrl)
    if (parsed.hostname === "db") {
      parsed.hostname = String(process.env.DATABASE_HOST_FALLBACK || "localhost").trim() || "localhost"
      return parsed.toString()
    }
  } catch {
    return rawUrl
  }

  return rawUrl
}

const datasourceUrl = resolveDatasourceUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    datasourceUrl
      ? {
          datasources: {
            db: {
              url: datasourceUrl,
            },
          },
        }
      : undefined,
  )

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
