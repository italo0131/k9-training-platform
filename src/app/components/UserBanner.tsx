"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { isRootRole } from "@/lib/role"

export default function UserBanner() {
  const { data } = useSession()
  const role = data?.user?.role || ""
  const isRoot = isRootRole(role)

  useEffect(() => {
    const html = document.documentElement
    if (!role) {
      html.classList.remove("root-mode")
      delete html.dataset.role
      return
    }
    html.dataset.role = String(role).toLowerCase()
    if (isRoot) {
      html.classList.add("root-mode")
    } else {
      html.classList.remove("root-mode")
    }
  }, [role, isRoot])

  if (!data?.user) return null

  return (
    <div className="app-banner border-b text-xs md:text-sm text-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2 md:gap-3">
        <span>
          Logado como: <strong>{data.user.name || data.user.email}</strong>
        </span>
        <span className="text-gray-400">â€¢</span>
        <span>
          Perfil: <strong>{data.user.role || "CLIENT"}</strong>
        </span>
        {isRoot && <span className="root-pill">Controle total ativo</span>}
        {data.user.emailVerifiedAt ? (
          <span className="text-emerald-300">Email verificado</span>
        ) : (
          <span className="text-amber-300">Email nÃ£o verificado</span>
        )}
      </div>
    </div>
  )
}



