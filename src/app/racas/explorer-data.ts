import { buildBreedStudyProfile, type BreedStudyProfile } from "@/lib/breed-study"
import { getBreedImageUrl } from "@/lib/breed-search"
import { getDogBreedCatalog } from "@/lib/thedogapi"

export async function loadBreedExplorerProfiles(limit = 36): Promise<{
  profiles: BreedStudyProfile[]
  errorMessage: string
}> {
  try {
    const catalogResult = await getDogBreedCatalog(200)
    const profiles = catalogResult.breeds.slice(0, limit).map((breed) =>
      buildBreedStudyProfile({
        ...breed,
        referenceImageUrl: getBreedImageUrl(breed.name, breed.referenceImageUrl),
      }),
    )

    return {
      profiles,
      errorMessage: "",
    }
  } catch (error) {
    console.error("Erro ao carregar perfis para o explorador de racas:", error)
    return {
      profiles: [],
      errorMessage: "Não foi possível carregar o radar de raças agora. Tente novamente em alguns instantes.",
    }
  }
}
