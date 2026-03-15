import Link from "next/link"

export default function CoursesPage() {
  return (
    <div className="min-h-[100svh] bg-slate-950 text-white px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold">Cursos</h1>
      <p className="text-gray-300 mt-2">Lista de cursos. Em construcao.</p>
      <Link href="/register" className="inline-block mt-6 rounded-lg border border-white/15 px-4 py-2 hover:bg-white/10">
        Quero acessar
      </Link>
    </div>
  )
}
