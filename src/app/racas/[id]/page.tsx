import Link from "next/link"
import { ArrowLeft, ArrowRight, BrainCircuit, Dog, GitCompare, Radar, Sparkles } from "lucide-react"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { buildBreedStudyProfile } from "@/lib/breed-study"
import { getBreedImageUrl } from "@/lib/breed-search"
import { getDogBreedById, type DogBreedLookup } from "@/lib/thedogapi"

interface BreedDetailPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 21600

export default async function BreedDetailPage({ params }: BreedDetailPageProps) {
  const { id } = await params

  let breed: DogBreedLookup | null = null
  try {
    breed = await getDogBreedById(id)
  } catch (error) {
    console.error("Erro ao buscar raça:", error)
    notFound()
  }

  if (!breed) notFound()

  const profile = buildBreedStudyProfile({
    ...breed,
    referenceImageUrl: getBreedImageUrl(breed.name, breed.referenceImageUrl),
  })

  return (
    <div className="min-h-[100svh] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.1),transparent_24%),linear-gradient(145deg,#020617,#08111f_45%,#020617)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/racas"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100 transition hover:-translate-y-0.5 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para raças</span>
        </Link>

        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.9),rgba(15,23,42,0.92)_45%,rgba(76,29,149,0.62)),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_30%)]">
          <div className="grid gap-0 lg:grid-cols-[420px_minmax(0,1fr)]">
            <div className="relative min-h-[320px] border-b border-white/10 lg:border-b-0 lg:border-r">
              <img
                src={profile.breed.referenceImageUrl || "/placeholder-dog.jpg"}
                alt={profile.breed.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0),rgba(2,6,23,0.65))]" />
              <div className="absolute left-5 top-5 rounded-full bg-slate-950/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100 backdrop-blur">
                {profile.groupLabel}
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
                  Guia de decisão
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  Porte: {profile.sizeLabel}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold md:text-5xl">{profile.breed.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200">{profile.summary}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <MeterSummary label="Energia" value={profile.energy.score} tone="cyan" description={profile.energy.label} />
                <MeterSummary label="Treinabilidade" value={profile.trainability.score} tone="emerald" description={profile.trainability.label} />
                <MeterSummary label="Convívio" value={profile.sociability.score} tone="amber" description={profile.sociability.label} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <FactCard title="Peso de referência" value={profile.weightLabel} />
                <FactCard title="Altura de referência" value={profile.heightLabel} />
                <FactCard title="Vida média" value={profile.lifeSpanLabel} />
                <FactCard title="Temperamento" value={profile.temperamentLabel || "Perfil não informado"} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/racas?q=${encodeURIComponent(profile.breed.name)}#comparador-racas`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#22d3ee,#10b981)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
                >
                  <GitCompare className="h-4 w-4" />
                  <span>Levar ao comparador</span>
                </Link>
                <Link
                  href={`/racas?q=${encodeURIComponent(profile.breed.name)}#radar-racas`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <Radar className="h-4 w-4" />
                  <span>Testar no radar</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <DetailPanel
              eyebrow="História e função"
              title="Como essa raça costuma entrar na vida real"
              icon={<Sparkles className="h-4 w-4" />}
            >
              {profile.historicalRole}
            </DetailPanel>

            <DetailPanel
              eyebrow="Rotina ideal"
              title="O que normalmente faz esse perfil funcionar melhor"
              icon={<Dog className="h-4 w-4" />}
            >
              {profile.idealRoutine}
            </DetailPanel>

            <DetailPanel
              eyebrow="Foco de treino"
              title="Onde vale concentrar energia na educação"
              icon={<BrainCircuit className="h-4 w-4" />}
            >
              {profile.trainingFocus}
            </DetailPanel>
          </div>

          <div className="space-y-6">
            <ListPanel
              title="Pontos fortes para observar"
              items={profile.studyHighlights.map((item) => `${item.title}: ${item.description}`)}
            />
            <ListPanel title="Atenção antes de decidir" items={profile.attentionPoints} />
            <DetailPanel
              eyebrow="Tutor ideal"
              title="Perfil de rotina que tende a aproveitar melhor essa raça"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              {profile.tutorProfile}
            </DetailPanel>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Próximo passo</p>
              <h2 className="mt-2 text-3xl font-semibold">Transforme a leitura em uma decisão prática</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Compare com outras opções, valide no radar de encaixe e, quando fizer sentido, já cadastre o cão com o perfil enriquecido.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/racas?q=${encodeURIComponent(profile.breed.name)}#coach-racas`}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
              >
                <BrainCircuit className="h-4 w-4" />
                <span>Ouvir a IA sobre essa raça</span>
              </Link>
              <Link
                href={`/dogs/new?breed=${encodeURIComponent(profile.breed.name)}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <Dog className="h-4 w-4" />
                <span>Cadastrar meu cão</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function MeterSummary({
  label,
  value,
  tone,
  description,
}: {
  label: string
  value: number
  tone: "cyan" | "emerald" | "amber"
  description: string
}) {
  const palette =
    tone === "emerald"
      ? "from-emerald-400 to-lime-400"
      : tone === "amber"
        ? "from-amber-400 to-orange-400"
        : "from-cyan-400 to-sky-400"

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/15 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span className="text-xs text-slate-200">{value}/5</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${palette}`} style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-300">{description}</p>
    </div>
  )
}

function FactCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  )
}

function DetailPanel({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string
  title: string
  icon: ReactNode
  children: string
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/6 p-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
        {icon}
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-4 text-sm leading-8 text-slate-300">{children}</p>
    </div>
  )
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/6 p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
