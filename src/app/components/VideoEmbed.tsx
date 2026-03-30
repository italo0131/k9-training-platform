import { getVideoPresentation } from "@/lib/video"

type Props = {
  url?: string | null
  title: string
  variant?: "default" | "reel"
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  poster?: string | null
}

export default function VideoEmbed({
  url,
  title,
  variant = "default",
  autoPlay = false,
  muted = false,
  loop = false,
  poster,
}: Props) {
  const video = getVideoPresentation(url)
  const isReel = variant === "reel"

  if (!video) return null

  if (video.kind === "direct") {
    return (
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-xl">
        <video
          controls
          autoPlay={autoPlay}
          muted={muted || autoPlay}
          loop={loop || autoPlay}
          playsInline
          poster={poster || undefined}
          className={`w-full bg-black ${isReel ? "aspect-[9/16] object-contain" : "h-full max-h-[520px]"}`}
        >
          <source src={video.src} />
          Seu navegador nao suporta reproducao de video.
        </video>
      </div>
    )
  }

  if (video.kind === "embed") {
    return (
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-xl">
        <div className={isReel ? "aspect-[9/16]" : "aspect-video"}>
          <iframe
            src={video.src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    )
  }

  return (
    <a
      href={video.src}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 hover:bg-cyan-500/20"
    >
      Abrir video
    </a>
  )
}
