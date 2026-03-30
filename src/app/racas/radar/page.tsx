import Link from "next/link"
import { ArrowLeft, Radar } from "lucide-react"

import BreedExplorer from "@/app/racas/BreedExplorer"
import { loadBreedExplorerProfiles } from "@/app/racas/explorer-data"

export const revalidate = 21600

export default async function RadarPage() {
  const { profiles, errorMessage } = await loadBreedExplorerProfiles(36)

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.12),transparent_24%),linear-gradient(145deg,#020617,#08111f_45%,#020617)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.94)_52%,rgba(6,78,59,0.68)),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%)] p-6 md:p-8">
          <Link
            href="/racas"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100 transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para raças</span>
          </Link>

          <div className="mt-6 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
              <Radar className="h-3.5 w-3.5" />
              <span>Radar de encaixe</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Descubra quais raças combinam melhor com sua vida real
            </h1>
            <p className="text-base leading-7 text-slate-200 md:text-lg">
              Preencha sua rotina, espaço, objetivo e nível de experiência. O radar faz a leitura e já organiza as melhores opções para você comparar.
            </p>
          </div>
        </section>

        <BreedExplorer profiles={profiles} errorMessage={errorMessage} pageTitle="Radar de encaixe" />
      </div>
    </div>
  )
}
