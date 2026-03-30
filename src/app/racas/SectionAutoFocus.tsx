"use client"

import { useEffect } from "react"

type Props = {
  sectionId: string
}

export default function SectionAutoFocus({ sectionId }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 120)

    return () => window.clearTimeout(timer)
  }, [sectionId])

  return null
}
