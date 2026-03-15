"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { isAdminRole, isRootRole } from "@/lib/role"

const baseLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/conteudos", label: "Conteudos" },
  { href: "/dogs", label: "Caes" },
  { href: "/dogs/new", label: "Novo cao" },
  { href: "/training", label: "Treinos" },
  { href: "/calendar", label: "Calendario" },
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/billing", label: "Assinatura" },
  { href: "/profile", label: "Perfil" },
]

const rootLinks = [
  { href: "/dashboard", label: "Root console" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/dogs", label: "Caes" },
  { href: "/admin/trainings", label: "Treinos" },
  { href: "/admin/schedule", label: "Agenda" },
  { href: "/admin/finance", label: "Financeiro" },
  { href: "/admin/security", label: "Seguranca" },
  { href: "/admin/companies", label: "Empresas" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data } = useSession()
  const [open, setOpen] = useState(false)
  const isAdmin = isAdminRole(data?.user?.role)
  const isRoot = isRootRole(data?.user?.role)
  const adminLabel = isRoot ? "Root" : "Admin"
  const baseNoDashboard = baseLinks.filter((link) => link.href !== "/dashboard")
  const links = isRoot
    ? [...rootLinks, ...baseNoDashboard]
    : isAdmin
      ? [...baseLinks, { href: "/admin", label: adminLabel }]
      : baseLinks

  return (
    <nav className="app-nav relative flex items-center justify-between px-4 sm:px-6 py-4 text-white border-b">
      <div className="flex items-center gap-3">
        <div className="font-bold tracking-wide">K9 Training</div>
        {isRoot && (
          <span className="root-badge text-[11px] uppercase tracking-[0.3em]">Root mode</span>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="lg:hidden rounded-lg border border-white/15 px-3 py-2 text-gray-100 hover:bg-white/10 transition"
          aria-expanded={open}
          aria-controls="app-menu"
        >
          Menu
        </button>
      </div>
      <div
        id="app-menu"
        className={`absolute left-0 top-full z-40 w-full border-b border-white/10 bg-slate-950/95 px-4 sm:px-6 py-4 lg:static lg:w-auto lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 ${
          open ? "block" : "hidden"
        } lg:block`}
      >
        <div className="flex flex-col gap-3 text-sm lg:flex-row lg:items-center">
          {data?.user ? (
            <>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
                {links.map((link) => {
                  const active = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2 rounded-lg transition hover:bg-white/10 ${
                        active ? "bg-white/10 text-[var(--accent-strong)]" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg border border-white/15 px-3 py-2 text-gray-100 hover:bg-white/10 transition"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/15 px-3 py-2 text-gray-100 hover:bg-white/10 transition"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-cyan-500 px-3 py-2 text-white font-semibold shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}








